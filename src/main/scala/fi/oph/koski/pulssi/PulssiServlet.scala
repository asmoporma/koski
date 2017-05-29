package fi.oph.koski.pulssi

import fi.oph.koski.config.KoskiApplication
import fi.oph.koski.koskiuser.AuthenticationSupport
import fi.oph.koski.servlet.{ApiServlet, NoCache}

class PulssiServlet(val application: KoskiApplication) extends ApiServlet with NoCache with AuthenticationSupport {
  get("/") {
    Map(
      "opiskeluoikeudet" -> pulssi.opiskeluoikeudet,
      "metriikka" -> pulssi.metriikka,
      "oppilaitosMäärätTyypeittäin" -> pulssi.oppilaitosMäärätTyypeittäin
    )
  }

  private def pulssi = application.koskiPulssi
}

