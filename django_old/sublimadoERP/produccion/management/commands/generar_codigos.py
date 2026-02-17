from django.core.management.base import BaseCommand
from produccion.barcode_generator import generar_barcode


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        codigos = [
            "OP26-L1-0001",
            "OP26-L1-0002",
            "OP26-L2-0001",
            "OP26-L3-0001",
            "OP26-L4-0001"
        ]

        for codigo in codigos:
            generar_barcode(codigo)

        print("Codigos generados")
