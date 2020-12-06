

def test_title(selenium):
    selenium.get("http://localhost:8000")
    assert "Envoy" in selenium.title
