# backend/scripts/inspect_excel.py
import pandas as pd

EXCEL_FILE = "data/Fichier général Translanga tous pays.xlsx"

df = pd.read_excel(EXCEL_FILE, sheet_name="Feuille1")  
print(df.columns.tolist())
