# -*- mode: python ; coding: utf-8 -*-

block_cipher = None


a = Analysis(['Analyse.py'],
             pathex=['/Users/arjunlawagon/PycharmProjects/JAT'],
             binaries=[],
             datas=[('/Users/arjunlawagon/.conda/envs/eel/lib/python3.8/site-packages/eel/eel.js', 'eel'), ('web', 'web')],
             hiddenimports=['bottle_websocket'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
          name='Analyse',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          upx_exclude=[],
          runtime_tmpdir=None,
          console=False , icon='analysis.icns')
app = BUNDLE(exe,
             name='Analyse.app',
             icon='analysis.icns',
             bundle_identifier=None)
