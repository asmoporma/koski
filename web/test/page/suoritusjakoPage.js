function SuoritusjakoPage() {
  var api = {
    openPage: function(secretKey) {
      return function() {openPage('/koski/opinnot/' + window.secrets[secretKey], api.isVisible)()}
    },
    changeLanguageButton: function() {
      return S('#topbar .change-lang')
    },
    header: function() {
      return S('.suoritusjako-page .oppija header')
    },
    headerText: function() {
      return S('.suoritusjako-page .oppija header').text()
    },
    isVisible: function() {
      return isElementVisible(S('.suoritusjako-page')) && !isLoading()
    },
    oppilaitosTitleText: function() {
      return textsOf(S('.oppilaitos-list .oppilaitos-container h2.oppilaitos-title'))
    },
    opiskeluoikeusTitleText: function() {
      return textsOf(S('.oppilaitos-list .oppilaitos-container .opiskeluoikeudet-list button'))
    },
    avaaOpiskeluoikeus: function(teksti) {
      return function() {
        return click(findSingle('.oppilaitos-list .oppilaitos-container .opiskeluoikeudet-list button.opiskeluoikeus-button:contains(' + teksti + ')'))()
      }
    }
  }
  return api
}
