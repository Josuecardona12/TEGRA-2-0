import barcode
from barcode.writer import ImageWriter

def generar_barcode(codigo):

    code128 = barcode.get("code128", codigo, writer=ImageWriter())

    filename = code128.save(f"barcodes/{codigo}")

    return filename
