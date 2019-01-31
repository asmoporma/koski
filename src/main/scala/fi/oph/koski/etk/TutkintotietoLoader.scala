package fi.oph.koski.etk

import java.sql.{Date, Timestamp}
import java.time.{Instant, LocalDate}

import fi.oph.koski.http.{HttpStatus, KoskiErrorCategory}
import fi.oph.koski.koskiuser.KoskiSession
import fi.oph.koski.raportointikanta.{RHenkilöRow, ROpiskeluoikeusAikajaksoRow, ROpiskeluoikeusRow, RaportointiDatabase}


object TutkintotietoLoader {

  def getTutkintotiedot(timeline: Timeline, raportointiDatabase: RaportointiDatabase): Either[HttpStatus, EtkResponse] = {
    val koulutusmuodot = Set("ammatillinenkoulutus")
    val vuosi = 2019
    val tutkintotiedotQueryResult: Seq[((ROpiskeluoikeusRow, ROpiskeluoikeusAikajaksoRow), RHenkilöRow)] = raportointiDatabase.tutkintotiedotAikaJaksolta(koulutusmuodot, timeline.alku, timeline.loppu)
    val tutkintotiedot = tutkintotiedotQueryResult.map { case ((opiskeluoikeusRow, aikajaksoRow), henkilöRow) =>
      EtkHenkilöJaTutkinto(
        henkilö = toEtkHenkilö(henkilöRow),
        tutkinto = toEtkTutkinto(opiskeluoikeusRow, aikajaksoRow)
      )
    }.toList

    Right(EtkResponse(vuosi, tutkintotiedot))
  }

  private def toEtkHenkilö(henkiloRow: RHenkilöRow) = {
    EtkHenkilö(
      hetu = henkiloRow.hetu,
      syntymäaika = henkiloRow.syntymäaika,
      sukunimi = henkiloRow.sukunimi,
      etunimet = henkiloRow.etunimet
    )
  }

  private def toEtkTutkinto(opiskeluoikeusRow: ROpiskeluoikeusRow, aikajaksoRow: ROpiskeluoikeusAikajaksoRow) = {
    EtkTutkinto(
      tutkinnonTaso = Some(opiskeluoikeusRow.koulutusmuoto),
      alkamispäivä = Some(aikajaksoRow.alku.toLocalDate),
      päättymispäivä = Some(aikajaksoRow.loppu.toLocalDate)
    )
  }
}

case class EtkHenkilö(hetu: Option[String], syntymäaika: Option[Date], sukunimi: String, etunimet: String)

case class EtkTutkinto(tutkinnonTaso: Option[String], alkamispäivä: Option[LocalDate], päättymispäivä: Option[LocalDate])

case class EtkHenkilöJaTutkinto(henkilö: EtkHenkilö, tutkinto: EtkTutkinto)

case class EtkResponse(vuosi: Int, tutkinnot: List[EtkHenkilöJaTutkinto])

