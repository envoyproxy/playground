
import io
import os
import tarfile
import tempfile
from typing import IO


# todo: convert to contextlib.context
# based on util in aiodocker for single file
def mktar_from_docker_context(path: str) -> IO:
    """
    Create a zipped tar archive from a Docker context
    **Remember to close the file object**
    Args:
        fileobj: a Dockerfile
    Returns:
        a NamedTemporaryFile() object
    """
    f = tempfile.NamedTemporaryFile()
    t = tarfile.open(mode="w:gz", fileobj=f)

    for name in os.listdir(path):
        # todo: handle dir recursion properly
        # todo: respect .dockerignore correctly
        if name.endswith('~'):
            continue
        fpath = os.path.join(path, name)
        with open(fpath) as _f:
            fileobject = io.BytesIO(_f.read().encode("utf-8"))
            f_mode = int(oct(os.stat(fpath).st_mode)[-3:])
        dfinfo = tarfile.TarInfo(name)
        dfinfo.size = len(fileobject.getvalue())
        dfinfo.mode = f_mode
        fileobject.seek(0)
        t.addfile(dfinfo, fileobject)
    t.close()
    f.seek(0)
    return f
