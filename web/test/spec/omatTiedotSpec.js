describe('Omat tiedot', function() {
  var omattiedot = OmatTiedotPage()
  var opinnot = OpinnotPage()
  var authentication = Authentication()
  var login = LoginPage()
  before(authentication.login(), resetFixtures)

  describe('Virkailijana', function() {
    before(authentication.login('Oili'), openPage('/koski/omattiedot'), wait.until(login.isVisible))
    it('siirrytään login-sivulle', function () {
    })
  })

  describe('Kansalaisena', function() {
    var etusivu = LandingPage()
    var korhopankki = KorhoPankki()
    before(authentication.logout, etusivu.openPage)

    describe('Kun kirjaudutaan sisään', function() {
      before(etusivu.login(), wait.until(korhopankki.isReady), korhopankki.login('030658-998X', 'Kansalainen', 'VÃ¤inÃ¶ TÃµnis', 'VÃ¤inÃ¶'), wait.until(omattiedot.isVisible))
      describe('Sivun sisältö', function() {
        it('Näytetään opiskeluoikeudet', function() {
          expect(omattiedot.nimi()).to.equal('Väinö Tõnis Kansalainen')
          expect(omattiedot.oppija()).to.equal('Opintoni')
          expect(opinnot.opiskeluoikeudet.oppilaitokset()).to.deep.equal([
            'Itä-Suomen yliopisto' ])
        })

        it('Näytetään opintoni-ingressi', function() {
          expect(omattiedot.ingressi()).to.equal(
            'Tällä sivulla näkyvät kaikki sähköisesti tallennetut opintosuoritukset yksittäisistä kursseista kokonaisiin tutkintoihin.'
          )
        })

        it("Näytetään nimi ja syntymäaika", function() {
          expect(omattiedot.headerNimi()).to.equal(
            'Väinö Tõnis Kansalainen\n' +
            's. 3.6.1958'
          )
        })

        it("Näytetään 'Mitkä tiedot palvelussa näkyvät?' -painike", function() {
          expect(!!omattiedot.palvelussaNäkyvätTiedotButton().length).to.equal(true)
        })

        it('Näytetään virheraportointi-painike', function() {
          expect(!!omattiedot.virheraportointiButton().length).to.equal(true)
        })

        describe("'Mitkä tiedot palvelussa näkyvät' -teksti", function () {
          it('Aluksi ei näytetä tekstiä', function () {
            expect(omattiedot.palvelussaNäkyvätTiedotText()).to.equal('')
          })

          describe('Kun painetaan painiketta', function () {
            before(click(omattiedot.palvelussaNäkyvätTiedotButton))

            it('näytetään teksti', function () {
              expect(omattiedot.palvelussaNäkyvätTiedotText()).to.equal(
                'Koski-palvelussa pystytään näyttämään seuraavat tiedot:\n' +
                'Vuoden 2018 tammikuun jälkeen suoritetut peruskoulun, lukion ja ammattikoulun opinnot ja voimassa olevat opiskeluoikeudet.\n' +
                'Vuoden 1990 jälkeen suoritetut ylioppilastutkinnot.\n' +
                'Korkeakoulutusuoritukset ja opiskeluoikeudet ovat näkyvissä pääsääntöisesti vuodesta 1995 eteenpäin, mutta tässä voi olla korkeakoulukohtaisia poikkeuksia.'
              )
            })
          })

          describe('Kun painetaan painiketta uudestaan', function () {
            before(click(omattiedot.palvelussaNäkyvätTiedotButton))

            it('teksti piilotetaan', function () {
              expect(omattiedot.palvelussaNäkyvätTiedotText()).to.equal('')
            })
          })

          describe('Kun teksti on näkyvissä', function () {
            before(click(omattiedot.palvelussaNäkyvätTiedotButton))

            it('alkutila (teksti näkyvissä)', function () {
              expect(omattiedot.palvelussaNäkyvätTiedotText()).to.not.equal('')
            })

            describe('Pop-upin painikkeella', function () {
              before(click(omattiedot.palvelussaNäkyvätTiedotCloseButton))

              it('voidaan piilottaa teksti', function () {
                expect(omattiedot.palvelussaNäkyvätTiedotText()).to.equal('')
              })
            })
          })
        })
      })

      describe('Kun kirjaudutaan ulos', function () {
        before(click(findSingle('#logout')), wait.until(etusivu.isVisible))
        it('Näytetään länderi', function() {

        })
      })

      describe('Kun henkilöllä on syntymäaika-tieto', function () {
        before(authentication.logout, etusivu.openPage)
        before(etusivu.login(), wait.until(korhopankki.isReady), korhopankki.login('010170-9173'), wait.until(omattiedot.isVisible))

        it('Näytetään nimi ja syntymäaika', function() {
          expect(omattiedot.headerNimi()).to.equal(
            'Sylvi Syntynyt\n' +
            's. 1.1.1970'
          )
        })
      })

      describe('Virheistä raportointi', function () {
        before(authentication.logout, etusivu.openPage)
        before(etusivu.login(), wait.until(korhopankki.isReady), korhopankki.login('180497-112F'), wait.until(omattiedot.isVisible))

        it('Aluksi ei näytetä lomaketta', function () {
          expect(omattiedot.virheraportointiForm.isVisible()).to.equal(false)
        })

        describe('Kun painetaan painiketta', function () {
          before(click(omattiedot.virheraportointiButton))

          var form = omattiedot.virheraportointiForm

          it('näytetään lista tiedoista, joita palvelussa ei pystytä näyttämään', function () {
            expect(form.contentsAsText()).to.equal(
              'Huomioithan, että Koski-palvelussa ei pystytä näyttämään seuraavia tietoja:\n' +
              'Korkeakoulututkintoja ennen vuotta 1995 . Tässä voi olla korkeakoulukohtaisia poikkeuksia.\n' +
              'Ennen vuotta 1990 suoritettuja ylioppilastutkintoja.\n' +
              'Ennen vuoden 2018 tammikuuta suoritettuja peruskoulun, lukion tai ammattikoulun suorituksia ja opiskeluoikeuksia.\n' +
              'Asiani koskee tietoa, joka näkyy, tai kuuluisi yllämainitun perusteella näkyä Koski-palvelussa.'
            )
          })

          describe('Kun hyväksytään huomio palvelusta löytyvistä tiedoista', function () {
            before(form.acceptDisclaimer)

            it('näytetään oppilaitosvaihtoehdot', function () {
              expect(form.oppilaitosNames()).to.deep.equal([
                'Kulosaaren ala-aste',
                'Jyväskylän normaalikoulu',
                'Muu'
              ])
            })

            it('oppilaitoksilla on oikeat OIDit', function () {
              expect(form.oppilaitosOids()).to.deep.equal([
                '1.2.246.562.10.64353470871',
                '1.2.246.562.10.14613773812',
                'other'
              ])
            })

            it('ei vielä näytetä yhteystietoja', function () {
              expect(form.oppilaitosOptionsText()).to.equal(
                'Voit tiedustella asiaa oppilaitokseltasi.\n' +
                'Kulosaaren ala-aste\n' +
                'Jyväskylän normaalikoulu\n' +
                'Muu'
              )
            })

            describe('Kun valitaan oppilaitos, jolle löytyy sähköpostiosoite', function () {
              before(form.selectOppilaitos('1.2.246.562.10.14613773812'))

              it('näytetään sähköpostiosoite ja oppilaitoksen nimi', function () {
                expect(form.yhteystiedot()).to.equal(
                  'joku.osoite@example.com\n' +
                  'Jyväskylän normaalikoulu'
                )
              })

              it('näytetään sähköposti-painike', function () {
                expect(!!form.sähköpostiButton().length).to.equal(true)
              })

              it('näytetään yhteystiedot kopioitavana tekstinä', function () {
                expect(form.yhteystiedotTekstinä()).to.equal(
                  'Muista mainita sähköpostissa seuraavat tiedot:\n' +
                  'Nimi: Miia Monikoululainen\n' +
                  'Syntymäaika: 18.4.1997\n' +
                  'Oppijanumero: 1.2.246.562.24.00000000010' +
                  ' ' +
                  'Kopioi'
                )
              })

              it('mailto-linkissä on oikea viestipohja', function () {
                expect(form.sähköpostiButtonMailtoContents()).to.equal(
                  'mailto:joku.osoite@example.com?' +
                  'subject=Tiedustelu%20opintopolun%20tiedoista&' +
                  'body=' +
                  encodeURIComponent(
                    '***Kirjoita viestisi tähän***\n\n' +
                    '———————————————————————————————\n\n' +
                    'Allaoleva teksti on luotu automaattisesti Opintopolun tiedoista. Koulu tarvitsee näitä tietoja pystyäkseen käsittelemään kysymystäsi.\n\n' +
                    'Nimi: Miia Monikoululainen\n' +
                    'Syntymäaika: 18.4.1997\n' +
                    'Oppijanumero: 1.2.246.562.24.00000000010'
                  )
                )
              })
            })

            describe('Kun valitaan oppilaitos, jolle ei löydy sähköpostiosoitetta', function () {
              before(form.selectOppilaitos('1.2.246.562.10.64353470871'))

              it('näytetään ainoastaan virheviesti', function () {
                expect(form.oppilaitosOptionsText()).to.equal(
                  'Voit tiedustella asiaa oppilaitokseltasi.\n' +
                  'Kulosaaren ala-aste\n' +
                  'Jyväskylän normaalikoulu\n' +
                  'Muu\n' +
                  'Oppilaitokselle ei löytynyt yhteystietoja.'
                )
              })
            })

            describe("Kun valitaan 'muu'", function () {
              before(form.selectOppilaitos('other'))

              it('näytetään oppilaitos-picker', function () {
                expect(isElementVisible(form.oppilaitosPicker)).to.equal(true)
              })

              describe('Kun valitaan pickerillä oppilaitos', function () {
                before(form.selectMuuOppilaitos('Ressun lukio'))

                it('näytetään sähköpostiosoite ja oppilaitoksen nimi', function () {
                  expect(form.yhteystiedot()).to.equal(
                    'joku.osoite@example.com\n' +
                    'Ressun lukio'
                  )
                })

                it('näytetään sähköposti-painike', function () {
                  expect(!!form.sähköpostiButton().length).to.equal(true)
                })

                it('näytetään yhteystiedot kopioitavana tekstinä', function () {
                  expect(form.yhteystiedotTekstinä()).to.equal(
                    'Muista mainita sähköpostissa seuraavat tiedot:\n' +
                    'Nimi: Miia Monikoululainen\n' +
                    'Syntymäaika: 18.4.1997\n' +
                    'Oppijanumero: 1.2.246.562.24.00000000010' +
                    ' ' +
                    'Kopioi'
                  )
                })
              })
            })
          })
        })
      })

      describe('Suoritusjako', function() {
        var form = omattiedot.suoritusjakoForm

        it('Aluksi ei näytetä lomaketta', function() {
          expect(form.isVisible()).to.equal(false)
        })

        describe('Kun painetaan painiketta', function() {
          before(click(omattiedot.suoritusjakoButton))

          it('näytetään ingressi', function() {
            expect(form.ingressi()).to.equal(
              'Luomalla jakolinkin voit näyttää suoritustietosi haluamillesi henkilöille (esimerkiksi työtä tai opiskelupaikkaa hakiessasi). ' +
              'Tiettyjä arkaluonteisia tietoja (muun muassa tietoa vammaisten opiskelijoiden tuesta) ei välitetä. ' +
              'Luotuasi linkin voit tarkistaa tarkan sisällön Esikatsele-painikkeella.'
            )
          })

          it('näytetään suoritusvaihtoehtojen otsikko', function() {
            expect(form.suoritusvaihtoehdotOtsikkoText()).to.equal('Valitse jaettavat suoritustiedot')
          })

          it('näytetään suoritusvaihtoehdot', function() {
            expect(form.suoritusvaihtoehdotText()).to.equal(
              'Kulosaaren ala-aste\n' +
              'Päättötodistus\n' +
              '7. vuosiluokka\n' +
              '6. vuosiluokka\n' +
              'Jyväskylän normaalikoulu\n' +
              'Päättötodistus\n' +
              '9. vuosiluokka\n' +
              '8. vuosiluokka'
            )
          })

          it('jakopainike on disabloitu', function() {
            expect(form.canCreateSuoritusjako()).to.equal(false)
          })
        })

        describe('Kun valitaan suoritus', function() {
          before(form.selectSuoritus(null, '1.2.246.562.10.14613773812', 'perusopetuksenvuosiluokka', '8'))

          it('jakopainike on enabloitu', function() {
            expect(form.canCreateSuoritusjako()).to.equal(true)
          })

          describe('Kun painetaan suoritusjaon luomispainiketta', function () {
            before(form.createSuoritusjako(), wait.until(form.suoritusjako(1).isVisible))

            it('suoritusjako näytetään', function() {
              var jako = form.suoritusjako(1)
              var secret = jako.url().split('/') // otetaan salaisuus talteen jaon hakemista varten
              window.secret = secret[secret.length - 1]

              expect(jako.isVisible()).to.equal(true)
            })

            it('suoritusjaon tiedot näytetään', function() {
              var jako = form.suoritusjako(1)

              var date = new Date()
              date.setMonth(date.getMonth() + 6)

              expect(jako.url()).to.match(/^.+\/opinnot\/[0-9a-f]{32}$/)
              expect(jako.voimassaoloaika()).to.equal('' +
                date.getDate() + '.' +
                (date.getMonth() + 1) + '.' +
                date.getFullYear()
              )
              expect(jako.esikatseluLinkHref()).to.equal(jako.url())
            })
          })
        })

        describe('Voimassaoloajan muuttaminen', function () {
          var date = new Date()
          date.setDate(date.getDate() + 1)
          var dateFormatted = '' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear()

          before(form.suoritusjako(1).setVoimassaoloaika(dateFormatted))

          it('toimii', function() {
            expect(form.suoritusjako(1).voimassaoloaika()).to.equal(dateFormatted)
          })
        })

        describe('Katselu', function () {
          var suoritusjako = SuoritusjakoPage()

          before(authentication.logout, suoritusjako.openPage(), wait.until(suoritusjako.isVisible))

          it('linkki toimii', function () {
            expect(suoritusjako.isVisible()).to.equal(true)
          })

          describe('Sivun sisältö', function() {
            it('Näytetään otsikko, nimi ja syntymäaika', function() {
              expect(suoritusjako.headerText()).to.equal(
                'Opinnot' +
                'Miia Monikoululainen' +
                's. 18.4.1997'
              )
            })

            it('Näytetään opiskeluoikeudet', function() {
              expect(opinnot.opiskeluoikeudet.oppilaitokset()).to.deep.equal([
                'Jyväskylän normaalikoulu'
              ])
            })

            it("Ei näytetä 'Mitkä tiedot palvelussa näkyvät?' -painiketta", function() {
              expect(!!omattiedot.palvelussaNäkyvätTiedotButton().length).to.equal(false)
            })

            it('Ei näytetä virheraportointi-painiketta', function() {
              expect(!!omattiedot.virheraportointiButton().length).to.equal(false)
            })

            it('Ei näytetä suoritusjako-painiketta', function() {
              expect(!!omattiedot.suoritusjakoButton().length).to.equal(false)
            })
          })
        })
      })

      describe('Kun tiedot löytyvät vain YTR:stä', function() {
        before(authentication.logout, etusivu.openPage)

        before(etusivu.login(), wait.until(korhopankki.isReady), korhopankki.login('010342-8411'), wait.until(omattiedot.isVisible))

        describe('Sivun sisältö', function() {
          it('Näytetään opiskeluoikeudet', function() {
            expect(omattiedot.nimi()).to.equal('Mia Orvokki Numminen')
            expect(omattiedot.oppija()).to.equal('Opintoni')
            expect(opinnot.opiskeluoikeudet.oppilaitokset()).to.deep.equal([
              'Ylioppilastutkintolautakunta' ])
          })
        })
      })

      describe('Virhetilanne', function() {
        before(authentication.logout, etusivu.openPage)

        before(etusivu.login(), wait.until(korhopankki.isReady), korhopankki.login('010342-8413'), wait.until(VirhePage().isVisible))

        describe('Sivun sisältö', function() {
          it('Näytetään virhesivu', function() {
            expect(VirhePage().teksti().trim()).to.equalIgnoreNewlines('Koski-järjestelmässä tapahtui virhe, yritä myöhemmin uudelleen\n          Palaa etusivulle')
          })
        })
      })
    })
  })
})
