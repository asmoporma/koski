package fi.oph.koski.virta

import fi.oph.koski.henkilo.Hetu
import fi.oph.koski.http.KoskiErrorCategory
import fi.oph.koski.koskiuser.KoskiUser
import fi.oph.koski.log.Logging
import fi.oph.koski.oppija.OppijaRepository
import fi.oph.koski.schema.UusiHenkilö

/*
  OppijaRepositoryn toteutus, jota käytetään oppijoiden etsimiseen Virta-järjestelmästä hetulla.
 */
case class VirtaOppijaRepository(v: VirtaClient, henkilöpalvelu: OppijaRepository, accessChecker: VirtaAccessChecker) extends OppijaRepository with Logging {
  override def findOppijat(query: String)(implicit user: KoskiUser) = {
    if (!accessChecker.hasAccess(user)) {
      Nil
    } else {
      Hetu.validFormat(query) match {
        case Left(_) =>
          Nil
        case Right(hetu) =>
          try {
            // Tänne tullaan vain, jos oppijaa ei löytynyt henkilöpalvelusta (ks CompositeOppijaRepository)
            val hakuehto: VirtaHakuehtoHetu = VirtaHakuehtoHetu(hetu)
            // Oppijan organisaatiot haetaan ensin tällä raskaammalla kyselyllä
            val organisaatiot = v.opintotiedot(hakuehto).toSeq.flatMap(_ \\ "Opiskeluoikeus" \ "Myontaja").map(_.text)
            // Organisaatioden avulla haetaan henkilötietoja ja valitaan niistä ensimmäinen validi
            val opiskelijaNodes = organisaatiot.flatMap(v.henkilötiedot(hakuehto, _)).flatMap(_ \\ "Opiskelija")
            opiskelijaNodes
              .map { opiskelijaNode => ((opiskelijaNode \ "Sukunimi").text, (opiskelijaNode \ "Etunimet").text) }
              .find { case (sukunimi, etunimet) => !sukunimi.isEmpty && !etunimet.isEmpty }
              .flatMap { case (sukunimi, etunimet) =>
                val kutsumanimi = etunimet.split(" ").toList.head
                // Validi oppija lisätään henkilöpalveluun, jolloin samaa oppijaa ei haeta enää uudestaan Virrasta
                henkilöpalvelu.findOrCreate(UusiHenkilö(hetu, etunimet, kutsumanimi, sukunimi)) match {
                  case Right(oid) => henkilöpalvelu.findByOid(oid)
                  case Left(error) =>
                    logger.error("Virta-oppijan lisäys henkilöpalveluun epäonnistui: " + error)
                    None
                }
              }
              .toList.map(_.toHenkilötiedotJaOid)
          } catch {
            case e: Exception =>
              logger.error(e)("Failed to fetch data from Virta")
              Nil
          }
      }
    }
  }

  override def findOrCreate(henkilö: UusiHenkilö)(implicit user: KoskiUser) = Left(KoskiErrorCategory.notImplemented.readOnly("Virta-järjestelmään ei voi lisätä henkilöitä"))

  override def findByOid(oid: String)(implicit user: KoskiUser) = None

  override def findByOids(oids: List[String])(implicit user: KoskiUser) = Nil
}


