module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'SBS_PDS',
        asar: true,
        win: {
          target: ['zip', 'nsis'],
          icon: './public/img/icons/win/test_im_your_father_win.ico',
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
          installerIcon: './public/img/icons/win/test_im_your_father_win.ico',
          uninstallerIcon: './public/img/icons/win/test_cat_icon.ico'
        },
        linux: {
          target: ['AppImage', 'deb', 'rpm', 'zip', 'tar.gz']
        },
        mac: {
          type: "distribution",
          target: ["pkg", "dmg"],
          artifactName: "${productName}-${version}-${os}.${ext}",
          category: "public.app-category.utilities",
          provisioningProfile: "embedded.provisionprofile",
          icon: './public/img/icons/mac/test_im_your_father_mac.icns',
        }
      }
    }
  }
}
