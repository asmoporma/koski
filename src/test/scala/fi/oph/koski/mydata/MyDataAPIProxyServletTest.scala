package fi.oph.koski.mydata

import fi.oph.koski.KoskiApplicationForTests
import fi.oph.koski.api.LocalJettyHttpSpecification
import fi.oph.koski.henkilo.MockOppijat
import fi.oph.koski.http.HttpTester
import fi.oph.koski.koskiuser.MockUsers
import org.scalatest.{FreeSpec, Matchers}
import org.json4s._
import org.json4s.jackson.Serialization.write

class MyDataAPIProxyServletTest extends FreeSpec with LocalJettyHttpSpecification with Matchers with HttpTester {

  implicit val formats = DefaultFormats

  val opiskelija = MockOppijat.markkanen
  val memberId = "hsl"
  val memberCode = "2769790-1" // HSL

  def application = KoskiApplicationForTests

  "ApiProxyServlet" - {
    "Ei palauta mitään mikäli X-ROAD-MEMBER headeria ei ole asetettu" in {
      requestOpintoOikeudet(opiskelija.hetu.get, Map.empty){
        status should equal(400)
        body should include("Vaadittu X-ROAD-MEMBER http-otsikkokenttä puuttuu")
      }
    }

    "Ei palauta mitään mikäli käyttäjä ei ole antanut lupaa" in {
      KoskiApplicationForTests.mydataRepository.delete(opiskelija.oid, memberId)

      requestOpintoOikeudet(opiskelija.hetu.get, memberHeaders(memberCode)){
        status should equal(403)
        body should include("X-ROAD-MEMBER:llä ei ole lupaa hakea opiskelijan tietoja")
      }
    }

    "Palauttaa opiskelutiedot mikäli käyttäjä on antanut siihen luvan" in {
      KoskiApplicationForTests.mydataRepository.create(opiskelija.oid, memberId)

      requestOpintoOikeudet(opiskelija.hetu.get, memberHeaders(memberCode)){
        status should equal(200)
        body should (include (MockOppijat.markkanen.etunimet) and include (MockOppijat.markkanen.sukunimi))
      }
    }
  }

  def memberHeaders(memberCode: String) = Map("X-ROAD-MEMBER" -> memberCode)

  def requestOpintoOikeudet[A](hetu: String, headers: Map[String, String])(f: => A) = {
    post(
      "api/omadata/oppija/",
      write(Map("hetu" -> hetu)),
      headers = authHeaders(MockUsers.luovutuspalveluKäyttäjä) ++ jsonContent ++ headers
    )(f)
  }
}
