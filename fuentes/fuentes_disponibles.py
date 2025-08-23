from kivy.core.text import LabelBase

def registrar_fuentes():
    
    LabelBase.register(name="Roboto_Mono_titulo", fn_regular="fuentes/RobotoMono-Bold.ttf")
    LabelBase.register(name="Roboto_Mono_contenido", fn_regular="fuentes/RobotoMono-SemiBoldItalic.ttf")
    LabelBase.register(name="Ancizar_botones", fn_regular="fuentes/AncizarSans-Bold.ttf")
    LabelBase.register(name="Ancizar_contenido", fn_regular="fuentes/AncizarSans-MediumItalic.ttf")
