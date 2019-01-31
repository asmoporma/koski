package fi.oph.koski.etk

import java.sql.Date
import java.time.LocalDate

import fi.oph.koski.KoskiApplicationForTests
import fi.oph.koski.api.LocalJettyHttpSpecification
import fi.oph.koski.json.JsonSerializer
import fi.oph.koski.koskiuser.MockUsers
import org.scalatest.{FreeSpec, Matchers}

class EläketurvakeskusSpec extends FreeSpec with LocalJettyHttpSpecification with Matchers {

  private val raportointiDatabase = KoskiApplicationForTests.raportointiDatabase

  "Tutkintotietojen muodostaminen" - {
    "Toimii" in {
      val alku = LocalDate.of(1920, 1, 1)
      val loppu = LocalDate.of(2020, 12, 12)
      postAikajakso(Timeline(alku, loppu)) {
        verifyResponseStatusOk()
      }
    }
  }

  private def postAikajakso[A](timeline: Timeline)(f: => A): A = {
    post(
      "api/eläketurvakeskus/tutkintotiedot",
      JsonSerializer.writeWithRoot(timeline),
      headers = authHeaders(MockUsers.paakayttaja) ++ jsonContent
    )(f)
  }
}
