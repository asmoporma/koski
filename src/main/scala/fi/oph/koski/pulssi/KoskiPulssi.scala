package fi.oph.koski.pulssi

import fi.oph.koski.cache._
import fi.oph.koski.config.KoskiApplication
import fi.oph.koski.userdirectory.KäyttöoikeusServiceClient
import fi.oph.koski.http.Http
import fi.oph.koski.koskiuser.MockUsers
import fi.oph.koski.perustiedot.{OpiskeluoikeudenPerustiedotStatistics, OpiskeluoikeusTilasto}
import fi.oph.koski.tiedonsiirto.{TiedonsiirtoStatistics, TiedonsiirtoTilasto}

import scala.concurrent.duration._


trait KoskiPulssi {
  def opiskeluoikeusTilasto: OpiskeluoikeusTilasto
  def tiedonsiirtoTilasto: TiedonsiirtoTilasto
  def metriikka: JulkinenMetriikka
  def oppilaitosMäärät: OppilaitosMäärät
  def oppijoidenMäärä: Int
  def käyttöoikeudet: KäyttöoikeusTilasto
  def metrics: KoskiMetriikka
}

class KoskiStats(application: KoskiApplication) extends KoskiPulssi {
  private val perustiedotStats = OpiskeluoikeudenPerustiedotStatistics(application.koskiElasticSearchIndex)
  private val tiedonsiirtoStats = TiedonsiirtoStatistics(application.koskiElasticSearchIndex)

  def opiskeluoikeusTilasto: OpiskeluoikeusTilasto = perustiedotStats.statistics
  def tiedonsiirtoTilasto: TiedonsiirtoTilasto = tiedonsiirtoStats.statistics
  def metriikka: JulkinenMetriikka = metrics.toPublic
  def oppijoidenMäärä: Int = perustiedotStats.henkilöCount.getOrElse(0)
  def käyttöoikeudet: KäyttöoikeusTilasto = {
    val ryhmät: Map[String, List[String]] = if (!application.fixtureCreator.shouldUseFixtures) {
      import scalaz.concurrent.Task.gatherUnordered
      val client = KäyttöoikeusServiceClient(application.config)

      Http.runTask(client.findKäyttöoikeusryhmät.flatMap { ryhmät =>
        gatherUnordered(ryhmät
          .map { ryhmä =>
            client.findKäyttöoikeusRyhmänHenkilöt(ryhmä.id).map(henkilöOids => (ryhmä.fi, henkilöOids))
          }
        )
      }.map(_.toMap))

    } else {
      MockUsers.users.flatMap(u => u.käyttöoikeusRyhmät.map(ko => (ko, u.ldapUser.oid))).groupBy(_._1).mapValues(_.map(_._2))
    }

    KäyttöoikeusTilasto(
      ryhmät.values.flatten.toList.distinct.size,
      ryhmät.map { case (x, y) => (x, y.size) }
    )
  }

  def metrics: KoskiMetriikka = application.prometheusRepository.koskiMetrics

  def oppilaitosMäärät = OppilaitosMäärät(Map(
    "Perusopetus" -> 2433,
    "Lukiokoulutus" -> 381,
    "Ammatillinen koulutus" -> 208
  ))
}

object KoskiPulssi {
  def apply(application: KoskiApplication)(implicit cm: CacheManager): KoskiPulssi with Cached = {
    CachingProxy[KoskiPulssi](
      ExpiringCache("KoskiPulssi", 10.minutes, maxSize = 5),
      new KoskiStats(application)
    )
  }
}

case class OppilaitosMäärät(koulutusmuodoittain: Map[String, Int]) {
  def yhteensä: Int = koulutusmuodoittain.values.sum
}

case class KäyttöoikeusTilasto(kokonaismäärä: Int, ryhmienMäärät: Map[String, Int])
