"""Run end-to-end tests against a local server with synthetic captures only."""
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread

from playwright.sync_api import expect, sync_playwright

# Serve sempre os arquivos deste repositório, inclusive quando chamado de outra pasta.
root = Path(__file__).resolve().parent
server = ThreadingHTTPServer(
    ("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root))
)
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p, TemporaryDirectory() as tmp:
        for name in os.environ.get("ENGINES", "chromium firefox").split():
            browser = getattr(p, name).launch(executable_path=os.environ.get("BROWSER_PATH"))
            for width in (320, 375, 1280):
                page = browser.new_page(viewport={"width": width, "height": 800})
                page.goto(f"http://127.0.0.1:{server.server_port}")
                page.get_by_role("button", name="Experimentar", exact=False).click()
                expect(page.get_by_role("row", name="2.000 ms ou mais 2 0 -2")).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                page.get_by_label("Tema").select_option("dark")
                expect(page.locator("html")).to_have_attribute("data-theme", "dark")
                page.get_by_label("Tema").select_option("system")
                page.emulate_media(color_scheme="dark")
                dark = page.evaluate("getComputedStyle(document.documentElement).backgroundColor")
                page.emulate_media(color_scheme="light")
                light = page.evaluate("getComputedStyle(document.documentElement).backgroundColor")
                assert dark != light, ("tema do sistema não segue o navegador", dark, light)
                page.get_by_label("Tema").select_option("dark")
                raw = {"log":{"entries":[{"request":{"url":"DADO_FICTICIO"},"response":{"status":404},"time":500}]}}
                page.locator("#a").set_input_files({"name":"teste.har","mimeType":"application/json","buffer":json.dumps(raw).encode()})
                expect(page.locator("#summary")).to_contain_text("A · 1 requisição")
                with page.expect_download() as download:
                    page.locator("#download").click()
                path = Path(tmp) / "boletim.txt"
                download.value.save_as(path)
                result = path.read_text()
                assert "DADO_FICTICIO" not in result and "4xx | 1 | 0 | -1" in result
                page.locator("#a").set_input_files({"name":"erro.har","mimeType":"application/json","buffer":b"{"})
                expect(page.locator("#message")).to_contain_text("JSON válido")
                expect(page.locator("#report")).to_be_hidden()
                page.locator("#clear").click()
                page.reload()
                expect(page.get_by_label("Tema")).to_have_value("dark")
                page.close()
            browser.close()
finally:
    server.shutdown()
    server.server_close()
