from pathlib import Path
root=Path(__file__).resolve().parent
(root/'index.html').write_text((root/'page.html').read_text(encoding='utf-8').replace('/* CORE_INSERT */',(root/'core.js').read_text(encoding='utf-8')).replace('/* I18N_INSERT */',(root/'i18n.js').read_text(encoding='utf-8')).replace('/* UI_INSERT */',(root/'ui.js').read_text(encoding='utf-8')),encoding='utf-8')
print('Built index.html')

