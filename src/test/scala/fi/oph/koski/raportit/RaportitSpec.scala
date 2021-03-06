package fi.oph.koski.raportit

import java.time.LocalDate
import java.sql.Date

import fi.oph.koski.KoskiApplicationForTests
import fi.oph.koski.api.{LocalJettyHttpSpecification, OpiskeluoikeusTestMethods}
import org.scalatest.{BeforeAndAfterAll, FreeSpec, Matchers}
import fi.oph.koski.henkilo.MockOppijat
import fi.oph.koski.http.KoskiErrorCategory
import fi.oph.koski.organisaatio.MockOrganisaatiot
import fi.oph.koski.koskiuser.MockUsers.{evira, omniaTallentaja}
import fi.oph.koski.log.AuditLogTester
import fi.oph.koski.raportointikanta.ROpiskeluoikeusAikajaksoRow
import org.json4s.JArray
import org.json4s.jackson.JsonMethods

class RaportitSpec extends FreeSpec with LocalJettyHttpSpecification with OpiskeluoikeusTestMethods with Matchers with BeforeAndAfterAll {

  private val raportointiDatabase = KoskiApplicationForTests.raportointiDatabase

  "Mahdolliset raportit -API" - {
    "sallii opiskelijavuositiedot ammatilliselle oppilaitokselle" in {
      authGet(s"api/raportit/mahdolliset-raportit/${MockOrganisaatiot.stadinAmmattiopisto}") {
        verifyResponseStatusOk()
        val parsedJson = JsonMethods.parse(body)
        parsedJson shouldBe a[JArray]
        parsedJson.asInstanceOf[JArray].values should contain("opiskelijavuositiedot")
      }
    }
    "ei salli mitään nykyisistä raporteista lukiolle" in {
      authGet(s"api/raportit/mahdolliset-raportit/${MockOrganisaatiot.ressunLukio}") {
        verifyResponseStatusOk()
        val parsedJson = JsonMethods.parse(body)
        parsedJson shouldBe a[JArray]
        parsedJson should equal(JArray(List.empty))
      }
    }
  }

  "Opiskelijavuositiedot" - {
    val oid = "1.2.246.562.15.123456"

    "raportti sisältää oikeat tiedot" in {
      val result = Opiskelijavuositiedot.buildRaportti(raportointiDatabase, MockOrganisaatiot.stadinAmmattiopisto, LocalDate.parse("2016-01-01"), LocalDate.parse("2016-12-31"))

      val aarnenOpiskeluoikeusOid = lastOpiskeluoikeus(MockOppijat.ammattilainen.oid).oid.get
      val aarnenRivi = result.find(_.opiskeluoikeusOid == aarnenOpiskeluoikeusOid)
      aarnenRivi shouldBe defined
      val rivi = aarnenRivi.get

      rivi.koulutusmoduulit should equal("361902")
      rivi.osaamisalat should equal(Some("1590"))
      rivi.viimeisinOpiskeluoikeudenTila should equal("valmistunut")
      rivi.opintojenRahoitukset should equal("4")
      rivi.opiskeluoikeusPäättynyt should equal(true)
      rivi.läsnäTaiValmistunutPäivät should equal(31 + 29 + 31 + 30 + 30 + 1) // Aarne graduated 31.5.2016, so count days from 1.1.2016 to 30.5.2016 + 31.5.2016
      rivi.arvioituPäättymispäivä should equal(Some(LocalDate.parse("2015-05-31")))
    }

    "opiskelijavuoteen kuuluvat ja muut lomat lasketaan oikein" - {
      "lasna-tilaa ei lasketa lomaksi" in {
        Opiskelijavuositiedot.lomaPäivät(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-15"), Date.valueOf("2016-05-31"), "lasna", Date.valueOf("2016-01-15"))
        )) should equal((0, 0))
      }
      "lyhyt loma (alle 28 pv) lasketaan kokonaan opiskelijavuoteen" in {
        Opiskelijavuositiedot.lomaPäivät(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-15"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-01-15")),
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-02-05"), "loma", Date.valueOf("2016-02-01")),
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-06"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-02-06"))
        )) should equal((5, 0))
      }
      "pitkästä lomasta lasketaan 28 pv opiskelijavuoteen, loput muihin" in {
        Opiskelijavuositiedot.lomaPäivät(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-01"), Date.valueOf("2016-12-31"), "loma", Date.valueOf("2016-01-01"))
        )) should equal((28, 366 - 28))
      }
      "jos loma on alkanut ennen tätä aikajaksoa" - {
        "jos päiviä on tarpeeksi jäljellä, koko jakso lasketaan opiskelijavuoteen" in {
          Opiskelijavuositiedot.lomaPäivät(Seq(
            ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-02-14"), "loma", Date.valueOf("2016-01-25"))
          )) should equal((14, 0))
        }
        "jos päiviä on jäljellä jonkin verran, osa jaksosta lasketaan opiskelijavuoteen" in {
          Opiskelijavuositiedot.lomaPäivät(Seq(
            ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-03-31"), "loma", Date.valueOf("2016-01-31"))
          )) should equal((27, 33))
        }
        "jos päiviä ei ole jäljellä yhtään, koko jakso lasketaan muihin lomiin" in {
          Opiskelijavuositiedot.lomaPäivät(Seq(
            ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-02-14"), "loma", Date.valueOf("2015-12-01"))
          )) should equal((0, 14))
        }
      }
    }

    "opiskelijavuosikertymä lasketaan oikein" - {

      "läsnäolopäivät lasketaan mukaan" in {
        Opiskelijavuositiedot.opiskelijavuosikertymä(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-01"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-01-01"))
        )) should equal(31)
      }

      "osa-aikaisuus huomioidaan" in {
        Opiskelijavuositiedot.opiskelijavuosikertymä(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-01"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-01-01"), osaAikaisuus = 50)
        )) should equal(15.5)
      }

      "valmistumispäivä lasketaan mukaan" in {
        Opiskelijavuositiedot.opiskelijavuosikertymä(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-01"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-01-01")),
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-02-01"), "valmistunut", Date.valueOf("2016-02-01"), opiskeluoikeusPäättynyt = true)
        )) should equal(32)
      }

      "eroamispäivää ei lasketa mukaan" in {
        Opiskelijavuositiedot.opiskelijavuosikertymä(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-01"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-01-01")),
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-02-01"), "eronnut", Date.valueOf("2016-02-01"), opiskeluoikeusPäättynyt = true)
        )) should equal(31)
      }

      "lomapäivät lasketaan mukaan" in {
        Opiskelijavuositiedot.opiskelijavuosikertymä(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-01"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-01-01")),
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-02-10"), "loma", Date.valueOf("2016-02-01"))
        )) should equal(41)
      }

      "valmistumispäivä lasketaan aina 100% läsnäolopäivänä, vaikka opinnot olisivat olleet osa-aikaisia" in {
        Opiskelijavuositiedot.opiskelijavuosikertymä(Seq(
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-01-01"), Date.valueOf("2016-01-31"), "lasna", Date.valueOf("2016-01-01"), osaAikaisuus = 50),
          ROpiskeluoikeusAikajaksoRow(oid, Date.valueOf("2016-02-01"), Date.valueOf("2016-02-01"), "valmistunut", Date.valueOf("2016-02-01"), opiskeluoikeusPäättynyt = true, osaAikaisuus = 50)
        )) should equal(16.5)
      }
    }

    "raportin lataaminen toimii (ja tuottaa audit log viestin)" in {
      val queryString1 = s"oppilaitosOid=${MockOrganisaatiot.stadinAmmattiopisto}&alku=2016-01-01&loppu=2016-12-31"
      val queryString2 = "password=dummy&downloadToken=test123"
      authGet(s"api/raportit/opiskelijavuositiedot?$queryString1&$queryString2") {
        verifyResponseStatusOk()
        val ENCRYPTED_XLSX_PREFIX = Array(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1).map(_.toByte)
        response.bodyBytes.take(ENCRYPTED_XLSX_PREFIX.length) should equal(ENCRYPTED_XLSX_PREFIX)
        AuditLogTester.verifyAuditLogMessage(Map("operation" -> "OPISKELUOIKEUS_RAPORTTI", "target" -> Map("hakuEhto" -> s"raportti=opiskelijavuositiedot&$queryString1")))
      }
    }

    "käyttöoikeudet" - {
      "raportin lataaminen vaatii käyttöoikeudet organisaatioon" in {
        authGet(s"api/raportit/opiskelijavuositiedot?oppilaitosOid=${MockOrganisaatiot.stadinAmmattiopisto}&alku=2016-01-01&loppu=2016-12-31&password=dummy", user = omniaTallentaja) {
          verifyResponseStatus(403, KoskiErrorCategory.forbidden.organisaatio("Käyttäjällä ei oikeuksia annettuun organisaatioon (esimerkiksi oppilaitokseen)."))
        }
      }

      "raportin lataaminen ei ole sallittu viranomais-käyttäjille (globaali-luku)" in {
        authGet(s"api/raportit/opiskelijavuositiedot?oppilaitosOid=${MockOrganisaatiot.stadinAmmattiopisto}&alku=2016-01-01&loppu=2016-12-31&password=dummy", user = evira) {
          verifyResponseStatus(403, KoskiErrorCategory.forbidden.organisaatio("Käyttäjällä ei oikeuksia annettuun organisaatioon (esimerkiksi oppilaitokseen)."))
        }
      }
    }

    "raportin lataaminen asettaa koskiDownloadToken-cookien" in {
      authGet(s"api/raportit/opiskelijavuositiedot?oppilaitosOid=${MockOrganisaatiot.stadinAmmattiopisto}&alku=2016-01-01&loppu=2016-12-31&password=dummy&downloadToken=test123") {
        verifyResponseStatusOk()
        val cookie = response.headers("Set-Cookie").find(x => x.startsWith("koskiDownloadToken"))
        cookie shouldBe defined
        cookie.get should include("koskiDownloadToken=test123;Path=/")
      }
    }
  }

  override def beforeAll(): Unit = {
    authGet("api/raportointikanta/clear") { verifyResponseStatusOk() }
    authGet("api/raportointikanta/opiskeluoikeudet") { verifyResponseStatusOk() }
    authGet("api/raportointikanta/henkilot") { verifyResponseStatusOk() }
    authGet("api/raportointikanta/organisaatiot") { verifyResponseStatusOk() }
    authGet("api/raportointikanta/koodistot") { verifyResponseStatusOk() }
  }
}
