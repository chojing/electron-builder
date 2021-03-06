module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'SBS_PDS_Anywhere',
        asar: true,
        win: {
          target: ['zip', 'nsis'],
          icon: './public/img/icons/win/arrow.ico',
          requestedExecutionLevel: 'requireAdministrator'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          installerLanguages: [
            'en_US',
            'ko_KR'
          ],
          language: '1042',
          installerIcon: './public/img/icons/win/arrow.ico',
          uninstallerIcon: './public/img/icons/win/arrow.ico'
        },
        linux: {
          target: ['AppImage', 'deb', 'rpm', 'zip', 'tar.gz']
        },
        mac: {
          type: 'distribution',
          target: ['pkg', 'dmg', 'zip'],
          // eslint-disable-next-line no-template-curly-in-string
          artifactName: '${productName}-${version}-${os}.${ext}',
          category: 'public.app-category.utilities',
          provisioningProfile: 'embedded.provisionprofile',
          icon: './public/img/icons/mac/arrow.icns'
        },
        publish: null
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map'
  }
}
