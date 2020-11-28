
import rapidjson as json

from aiohttp import web

from aiodocker.exceptions import DockerError


class PlaygroundEventHandler(object):

    async def handle_container(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        handlers = ["destroy", "start", "die"]
        if event['Action'] not in handlers:
            return
        is_playground_container = set([
            "envoy.playground.proxy",
            "envoy.playground.service"]).intersection(
                event["Actor"]["Attributes"])
        is_proxy_create_container = (
            "envoy.playground.temp.resource" in event["Actor"]["Attributes"]
            and event['status'] == 'start')
        if is_playground_container:
            await getattr(
                self,
                'handle_container_%s' % event['Action'])(ws, event)
        elif is_proxy_create_container:
            await self.handle_proxy_creation(ws, event)

    async def handle_container_die(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        # print('CONTAINER DIE', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        container = await self.connector.get_container(event["id"])
        try:
            logs = await container.log(stdout=True, stderr=True)
            await container.delete(force=True, v=True)
        except DockerError:
            # most likely been killed
            logs = []
        await self.publish(
            ws,
            dict(type="container",
                 resource=resource,
                 id=event["id"][:10],
                 logs=logs,
                 name=event["Actor"]["Attributes"]["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event["status"]))

    async def handle_container_destroy(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        # print('CONTAINER DESTROY', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        await self.publish(
            ws,
            dict(type="container",
                 resource=resource,
                 id=event["id"][:10],
                 name=event["Actor"]["Attributes"]["name"].replace(
                     f'envoy__playground__{resource}__', ''),
                 status=event["status"]))

    async def handle_container_start(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        # print('PROXY START', event)
        resource = (
            "proxy"
            if "envoy.playground.proxy" in event["Actor"]["Attributes"]
            else "service")
        container = await self.connector.get_container(event["id"])
        to_publish = dict(
            type="container",
            resource=resource,
            id=event["id"][:10],
            image=event['Actor']['Attributes']['image'],
            name=event["Actor"]["Attributes"]["name"].replace(
                f'envoy__playground__{resource}__', ''),
            status=event["status"])
        ports = container['HostConfig']['PortBindings'] or {}
        port_mappings = []
        for container_port, mappings in ports.items():
            for mapping in mappings:
                if mapping['HostPort']:
                    port_mappings.append(
                        dict(mapping_from=mapping['HostPort'],
                             mapping_to=container_port.split('/')[0]))
        if port_mappings:
            to_publish["port_mappings"] = port_mappings
        await self.publish(
            ws,
            to_publish)

    async def handle_image(
            self,
            ws: web.WebSocketResponse,
            event):
        if event['Action'] == 'pull':
            # todo: if image is one configured for envoy or services
            #  then emit a signal to ui. This will be more useful
            #  when socket events are fixed.
            pass

    async def handle_network(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        handlers = ["destroy", "create", "connect", "disconnect"]
        if event['Action'] in handlers:
            await getattr(
                self,
                'handle_network_%s' % event['Action'])(
                    ws, event)

    async def handle_network_connect(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        nid = event["Actor"]["ID"]
        network = await self.connector.get_network(nid)
        info = await network.show()
        if "envoy.playground.network" in info["Labels"]:
            name = info["Labels"]["envoy.playground.network"]
            containers = [
                container[:10]
                for container
                in info["Containers"].keys()]
            await self.publish(
                ws,
                dict(type="network",
                     action=event["Action"],
                     networks={
                         name: dict(name=name, id=nid[:10],
                                    containers=containers)}))

    async def handle_network_create(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        name = event["Actor"]["Attributes"]["name"]
        nid = event["Actor"]["ID"]
        network = await self.connector.get_network(nid)
        info = await network.show()
        name = info["Labels"]["envoy.playground.network"]
        if "envoy.playground.network" not in info["Labels"]:
            return
        await self.publish(
            ws,
            dict(type="network",
                 action=event["Action"],
                 networks={name: dict(name=name, id=nid[:10])}))

    async def handle_network_destroy(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        await self.publish(
            ws,
            dict(type="network",
                 action=event["Action"],
                 id=event["Actor"]["ID"][:10]))

    async def handle_network_disconnect(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        name = event["Actor"]["Attributes"]["name"]
        nid = event["Actor"]["ID"]
        try:
            network = await self.connector.get_network(nid)
            info = await network.show()
        except DockerError:
            return
        if "envoy.playground.network" in info["Labels"]:
            name = info["Labels"]["envoy.playground.network"]
            containers = [
                container[:10]
                for container
                in info["Containers"].keys()]
            await self.publish(
                ws,
                dict(type="network",
                     action=event["Action"],
                     networks={
                         name: dict(name=name, id=nid[:10],
                                    containers=containers)}))

    async def handle_proxy_creation(
            self,
            ws: web.WebSocketResponse,
            event):
        # print('PROXY CREATE', event)
        await self.publish(
            ws,
            dict(type="container",
                 resource=event["Actor"]["Attributes"]["name"].split('__')[1],
                 name=event["Actor"]["Attributes"]["name"].split('__')[2],
                 status='creating'))

    async def publish(
            self,
            ws: web.WebSocketResponse,
            event: dict) -> None:
        # print("PUBLISH", event)
        await ws.send_json(event, dumps=json.dumps)
