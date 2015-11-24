package fi.oph.tor.koodisto

import com.typesafe.config.Config
import fi.oph.tor.util.{CachingProxy, TimedProxy}

trait KoodistoPalvelu {
  def getKoodistoKoodit(koodisto: KoodistoViittaus): Option[List[KoodistoKoodi]]
  def getKoodisto(koodisto: KoodistoViittaus): Option[Koodisto]
  def getAlakoodit(koodiarvo: String): List[Alakoodi]
  def getLatestVersion(koodisto: String): Int
}

object KoodistoPalvelu {
  def apply(config: Config) = {
    // TODO: duplication
    CachingProxy(config, TimedProxy(if (config.hasPath("koodisto.url")) {
      new RemoteKoodistoPalvelu(config.getString("koodisto.url"))
    }
    else if (config.hasPath("opintopolku.virkailija.url")) {
      new RemoteKoodistoPalvelu(config.getString("opintopolku.virkailija.url") + "/koodisto-service")
    } else {
      new MockKoodistoPalvelu
    }))
  }
}