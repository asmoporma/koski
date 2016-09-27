package fi.oph.koski.schema


import java.time.LocalDate

import fi.oph.koski.localization.LocalizedString
import fi.oph.scalaschema.annotation.{Description, MaxItems, MinItems, Title}

case class PerusopetuksenLisäopetuksenOpiskeluoikeus(
  id: Option[Int] = None,
  versionumero: Option[Int] = None,
  lähdejärjestelmänId: Option[LähdejärjestelmäId] = None,
  oppilaitos: Oppilaitos,
  koulutustoimija: Option[OidOrganisaatio],
  alkamispäivä: Option[LocalDate],
  päättymispäivä: Option[LocalDate],
  tila: PerusopetuksenOpiskeluoikeudenTila,
  läsnäolotiedot: Option[YleisetLäsnäolotiedot],
  lisätiedot: Option[PerusopetuksenLisäopetuksenOpiskeluoikeudenLisätiedot] = None,
  @MinItems(1)
  @MaxItems(1)
  suoritukset: List[PerusopetuksenLisäopetuksenSuoritus],
  @KoodistoKoodiarvo("perusopetuksenlisaopetus")
  tyyppi: Koodistokoodiviite = Koodistokoodiviite("perusopetuksenlisaopetus", "opiskeluoikeudentyyppi")
) extends KoskeenTallennettavaOpiskeluoikeus {
  override def withIdAndVersion(id: Option[Int], versionumero: Option[Int]) = this.copy(id = id, versionumero = versionumero)
  override def withKoulutustoimija(koulutustoimija: OidOrganisaatio) = this.copy(koulutustoimija = Some(koulutustoimija))
  override def withSuoritukset(suoritukset: List[PäätasonSuoritus]) = copy(suoritukset = suoritukset.asInstanceOf[List[PerusopetuksenLisäopetuksenSuoritus]])
  override def arvioituPäättymispäivä = None
}

case class PerusopetuksenLisäopetuksenOpiskeluoikeudenLisätiedot(
  @Description("""Pidennetty oppivelvollisuus alkamis- ja päättymispäivineen. Kentän puuttuminen tai null-arvo tulkitaan siten, että oppilaalla ei ole pidennettyä oppivelvollisuutta.""")
  @OksaUri("tmpOKSAID517", "pidennetty oppivelvollisuus")
  pidennettyOppivelvollisuus: Option[Päätösjakso] = None
)

case class PerusopetuksenLisäopetuksenSuoritus(
  @Title("Koulutus")
  koulutusmoduuli: PerusopetuksenLisäopetus,
  toimipiste: OrganisaatioWithOid,
  tila: Koodistokoodiviite,
  vahvistus: Option[Henkilövahvistus] = None,
  suorituskieli: Option[Koodistokoodiviite] = None,
  @Description("Oppiaineiden suoritukset")
  @Title("Oppiaineet")
  override val osasuoritukset: Option[List[PerusopetuksenLisäopetuksenOppiaineenSuoritus]],
  todistuksellaNäkyvätLisätiedot: Option[LocalizedString] = None,
  @KoodistoKoodiarvo("perusopetuksenlisaopetus")
  tyyppi: Koodistokoodiviite = Koodistokoodiviite("perusopetuksenlisaopetus", koodistoUri = "suorituksentyyppi"),
  liitetiedot: Option[List[PerusopetuksenLisäopetuksenSuorituksenLiitetiedot]] = None
) extends PäätasonSuoritus with Toimipisteellinen {
  def arviointi: Option[List[KoodistostaLöytyväArviointi]] = None
}

@Description("Päättötodistukseen kuuluvat liitteet, liitteistä ei tule mainintaa päättötodistukseen")
case class PerusopetuksenLisäopetuksenSuorituksenLiitetiedot(
  @Description("Liitetiedon tyyppi kooditettuna")
  @KoodistoUri("perusopetuksenlisaopetuksensuorituksenliitetieto")
  tunniste: Koodistokoodiviite,
  @Description("Lisätiedon kuvaus")
  kuvaus: LocalizedString
)

@Description("Perusopetuksen oppiaineen suoritus osana perusopetuksen lisäopetusta")
case class PerusopetuksenLisäopetuksenOppiaineenSuoritus(
  @Title("Oppiaine")
  koulutusmoduuli: PerusopetuksenOppiaine,
  tila: Koodistokoodiviite,
  arviointi: Option[List[PerusopetuksenOppiaineenArviointi]] = None,
  @Description("Tieto siitä, onko kyseessä perusopetuksen oppiaineen arvosanan korotus. Tietoa käytetään todistuksella.")
  korotus: Boolean,
  suorituskieli: Option[Koodistokoodiviite],
  @KoodistoKoodiarvo("perusopetuksenlisaopetuksenoppiaine")
  tyyppi: Koodistokoodiviite = Koodistokoodiviite(koodiarvo = "perusopetuksenlisaopetuksenoppiaine", koodistoUri = "suorituksentyyppi")
) extends OppiaineenSuoritus with VahvistuksetonSuoritus

@Description("Perusopetuksen lisäopetuksen tunnistetiedot")
case class PerusopetuksenLisäopetus(
  @KoodistoKoodiarvo("020075")
  tunniste: Koodistokoodiviite = Koodistokoodiviite("020075", koodistoUri = "koulutus"),
  @Description("Tutkinnon perusteen diaarinumero")
  perusteenDiaarinumero: Option[String] = None
) extends Koulutus {
  def laajuus = None
}