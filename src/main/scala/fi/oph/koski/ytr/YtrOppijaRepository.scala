package fi.oph.koski.ytr

import fi.oph.koski.henkilo.Hetu
import fi.oph.koski.http.KoskiErrorCategory
import fi.oph.koski.koskiuser.{AccessChecker, KoskiUser}
import fi.oph.koski.log.Logging
import fi.oph.koski.oppija.OppijaRepository
import fi.oph.koski.schema.UusiHenkilö

/*
  OppijaRepositoryn toteutus, jota käytetään oppijoiden etsimiseen YTR-rekisteristä hetulla.
 */
case class YtrOppijaRepository(ytr: YlioppilasTutkintoRekisteri, henkilöpalvelu: OppijaRepository, accessChecker: AccessChecker) extends OppijaRepository with Logging {
  override def findOppijat(query: String)(implicit user: KoskiUser) = if (!accessChecker.hasAccess(user)) {
    Nil
  } else {
    Hetu.validFormat(query) match {
      case Left(_) =>
        Nil
      case Right(hetu) =>
        try {
          ytr.oppijaByHetu(hetu).flatMap { ytrOppija =>
            val kutsumanimi = ytrOppija.firstnames.split(" ").toList.head
            henkilöpalvelu.findOrCreate(UusiHenkilö(hetu, ytrOppija.firstnames, kutsumanimi, ytrOppija.lastname)) match {
              case Right(oid) =>
                henkilöpalvelu.findByOid(oid)
              case Left(error) =>
                logger.error("YTR-oppijan lisäys henkilöpalveluun epäonnistui: " + error)
                None
            }
          }.toList.map(_.toHenkilötiedotJaOid)
        } catch {
          case e: Exception =>
            logger.error(e)("Failed to fetch data from YTR")
            Nil
        }
    }
  }

  override def findOrCreate(henkilö: UusiHenkilö)(implicit user: KoskiUser) = Left(KoskiErrorCategory.notImplemented.readOnly("Virta-järjestelmään ei voi lisätä henkilöitä"))

  override def findByOid(oid: String)(implicit user: KoskiUser) = None

  override def findByOids(oids: List[String])(implicit user: KoskiUser) = Nil
}
