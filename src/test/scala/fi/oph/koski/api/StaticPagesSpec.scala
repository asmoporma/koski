package fi.oph.koski.api

import fi.oph.koski.IndexServlet
import org.scalatest.{FreeSpec, Matchers}

class StaticPagesSpec extends FreeSpec with LocalJettyHttpSpecification with Matchers {
  val indexHtml = IndexServlet.html().toString

  "Single page app" - {
    verifyAppAt("")
    verifyAppAt("oppija/asdf")
    verifyAppAt("uusioppija")
    verifyAppAt("asdf", 404)

    def verifyAppAt(path: String, responseCode: Int = 200) = {
      "GET " + path in {
        authGet(path) {
          verifyResponseStatus(responseCode)
          body should equal(indexHtml)
        }
      }
    }
  }

  "Static resources" in {
    get("images/loader.gif") { verifyResponseStatus(200)}
    get("js/koski-main.js") { verifyResponseStatus(200)}
    get("js/koski-login.js") { verifyResponseStatus(200)}
    get("test/runner.html") { verifyResponseStatus(200)}
    get("js/codemirror/codemirror.js") { verifyResponseStatus(200)}
  }

  "Documentation" in {
    get("documentation") { verifyResponseStatus(200)}
  }
}