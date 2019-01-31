package fi.oph.koski.etk

import java.time.LocalDate

import fi.oph.koski.config.KoskiApplication
import fi.oph.koski.http.{JsonErrorMessage, KoskiErrorCategory}
import fi.oph.koski.json.JsonSerializer
import fi.oph.koski.koskiuser.RequiresVirkailijaOrPalvelukäyttäjä
import fi.oph.koski.log.Logging
import fi.oph.koski.servlet.{ApiServlet, NoCache}
import org.json4s.JsonAST.JValue
import org.scalatra.ContentEncodingSupport


class EläketurvakeskusServlet(implicit val application: KoskiApplication) extends ApiServlet with RequiresVirkailijaOrPalvelukäyttäjä with Logging with NoCache {

  before() {
    if (request.getRemoteHost != "127.0.0.1") {
      haltWithStatus(KoskiErrorCategory.forbidden(""))
    }
  }

  post("/tutkintotiedot") {
    withJsonBody { parsedJson =>
      renderEither(parseTimelineRequest(parsedJson).flatMap(TutkintotietoLoader.getTutkintotiedot(_, application.raportointiDatabase)))
    }()
  }

  private def parseTimelineRequest(parsedJson: JValue) = {
    JsonSerializer.validateAndExtract[Timeline](parsedJson)
      .left.map(errors => KoskiErrorCategory.badRequest.validation.jsonSchema(JsonErrorMessage(errors)))
  }
}

case class Timeline(alku: LocalDate, loppu: LocalDate)

