from re import U
import requests 
from bs4 import BeautifulSoup

r = requests.get('https://sanktpeter.com/angebote/')
soup = BeautifulSoup(r.text, 'html.parser')

'''for event in soup.find_all(class_="events_desc"): 
    print(event.string)

    date = event.find (class_="date-line")
    print(date.text)'''
    
ueberschriften = soup.find_all("h3")
#print(ueberschrift.text)

for i in ueberschriften:
    print (ueberschriften)