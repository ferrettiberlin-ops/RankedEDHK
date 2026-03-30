import supabase 
import requests
from bs4 import BeautifulSoup
import re

URL="https://uovmgtrbycdcwtqvsbbd.supabase.co"
KEY="sb_publishable_UpT-XZ4DVugyyqcXmXhULw_cMX-hchw"

from supabase import create_client, Client
from dotenv import load_dotenv
import os 


load_dotenv() 

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(URL, KEY)

try:
    response =supabase.table("program_list").select("*").execute()
    print(response.data)
except Exception as e:
    print(e)

website_list = ["https://www.jupas.edu.hk/en/programme/hku/",
                "https://www.jupas.edu.hk/en/programme/hkust/",
                "https://www.jupas.edu.hk/en/programme/cityuhk/",
                "https://www.jupas.edu.hk/en/programme/cuhk/",
                "https://www.jupas.edu.hk/en/programme/hkbu/",
                "https://www.jupas.edu.hk/en/programme/eduhk/",
                "https://www.jupas.edu.hk/en/programme/lingnanu/",
                "https://www.jupas.edu.hk/en/programme/polyu/",
                "https://www.jupas.edu.hk/en/programme/hkmu/",

                ]
name_list = ["HKU", "HKUST", "HKCityU", "CUHK", "HKBU", "EDUHK", "LINGNAN", "POLYU", "HKMU"]
Program_catalog = []

for i in website_list:
    def scrape():
        url = i
        a = []
        response = requests.get(url)
        response.ending = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        programs = soup.find_all(attrs={'class' : 'c-ft'})
        for c in programs:
            # 2. Grab only the FIRST text node (the English title)
            # recursive=False stops it from entering the <span> tags
            title = c.find(string=True, recursive=False)

            if title:
                a.append(title.strip())
        
        a.pop(0) 
        Program_catalog.append(a)
        
    if __name__ == '__main__':
        scrape()

Max_length = []
for J in Program_catalog:
    Max_length.append(len(J))

max_position = Max_length.index(max(Max_length))


for P in Program_catalog[max_position]:
    base_list = []
    for y in Program_catalog:
        try:
            base_list.append(Program_catalog[Program_catalog.index(y)][Program_catalog[max_position].index(P)])
        except:
            base_list.append("NA")
    response = (
    supabase.table("program_list")
    .upsert([{
    "HKU": base_list[0],
    "HKUST": base_list[1],
    "HKCityU": base_list[2],
    "CUHK": base_list[3],
    "HKBU": base_list[4],
    "EDUHK": base_list[5],
    "LINGNAN": base_list[6],
    "POLYU": base_list[7],
    "HKMU": base_list[8],
}])

    

    
    .execute()
)
        



