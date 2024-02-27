'''
Run by executing `python -m utils.test_spotting` from the root directory
'''

import unittest
from utils.spotting import spotting

class SpottingTests(unittest.TestCase):
    def setUp(self):
        self.spottings = [
        """
        🇷🇺 [Yandex] [2023/12/23](https://rosfines.ru/fines/?ordinanceDetails=528574607) in [Moscow, Russia](https://maps.app.goo.gl/eRaevCAwDdAvJeRU6)
        """,
        
        
        """
        🇲🇾 [Ari] 2023/08/18 in Tasek Gelugor, Penang, Malaysia
        • __source:__ https://www.tiktok.com/@agroboss99/video/7268492069788716289
        • __location:__ <TBD>
        """,
        
        
        """
        🇫🇷 [Cyclomedia] 2023/08/17 in Paris, Île-de-France, France
        source: me
        location: https://maps.app.goo.gl/LDHw872KcsCD69kz8?g_st=ic
        """,
        
        
        """ 
        🇷🇺 [Yandex] [2023/09/11](https://vk.com/wall-108494404_1183233) in [Arzamas, Nizhny N](https://yandex.ru/maps/-/CDUv7GL8)[ovgorod Oblast, Russia](https://maps.app.goo.gl/PXPXJgmsMrJtmY967)
        """, # very challenging one as it has two separate locs, but somehow regex works fine with this
        
        
        # """
        # 🇧🇷 [Apple] 2023/10/27 in São Paulo, State of São Paulo, Brazil
        # """, # no source, no location
        
        # New Spottings
        """
        🇧🇷 [2024/01/31](<https://twitter.com/desastrosoofc/status/1752779544539382060/photo/1>) in [Medianeira, State of Paraná, Brazil](<https://maps.app.goo.gl/dv5rjVT2yL8nkwQT6>)
        """,
        
        
        """
        🇲🇽 [2024/01/25](<https://www.facebook.com/photo?fbid=2416677255199212&set=a.140230339510593>) in Cananea, Sonora, Mexico
        """,
        
        
        """
        🇧🇩 [2024/01/18](https://www.facebook.com/photo?fbid=1053457542539145&set=pcb.1053457662539133) in Dhaka, Dhaka Division, Bangladesh (same location as https://discord.com/channels/747030604897452130/774703077172838430/1197084582093262949, but a different date)
        """,
        
        
        
        # Legacy Spottings
        """
        🇲🇽 2023/08/11 in Tula, Hidalgo, Mexico
        • __source:__ https://www.tiktok.com/@angelhm189/video/7266205282777238790?q=angelhm189&t=1692747200234
        • __location:__ <TBD>
        """,
        
        
        """
        🇬🇧 🏴󠁧󠁢󠁥󠁮󠁧󠁿 2023/04/04 in Ossett, England, United Kingdom
        • __source:__ <https://www.youtube.com/watch?v=bxHwGBANL9M> (video showing the car and a bit of interior)
        • __location:__ <TBD>
        """,
        
        
        """
        🇮🇹 2023/04/03 in Castelsardo, Sardinia, Italy
        source: https://twitter.com/sneuperdokkum/status/1642834947638435841/photo/1
        location: https://maps.app.goo.gl/WAwG7pkihVFxpuup9
        """,
        
        # very legacy spotting
        """
        2020/11/17 in Bahalma, Scotland (https://www.instagram.com/p/CHq2NHaBRzP/)
        """,
        """
        🇮🇹 2021/06/22 - Monopoli, Apulia/Puglia, Italy (https://www.instagram.com/p/CQbbeEklkyy/)
        """,
        """
        🇺🇸 [2024/02/05](https://www.facebook.com/photo/?fbid=10232513997462646&set=a.10201347744445799) in [Hayesville, North Carolina, USA](https://maps.app.goo.gl/vqspMRsKLCiqsbk16)
        """,
        """
        🇺🇸 2021/06/25 - Tompkins Square Park, New York, America (https://twitter.com/evgrieve/status/1408522273338888195)
        """,
        
        # informal spottings
        "🇩🇪 2015 in Wuppertal, North Rhine-Westphalia, Germany/ Source:https://www.facebook.com/photo/?fbid=1079848908707343&set=a.103161796376064",
        "🇧🇴 2015 in Valle de la Luna, La Paz, Bolivia / Source: https://www.instagram.com/p/BftGaiAAG6n/?igshid=MjlkZjg0ZTE3YQ%3D%3D",
        "🇩🇴 2019 in Santiago de los Caballeros, Dominican Republic / Source: https://www.facebook.com/photo/?fbid=10218963022130618&set=a.1538603549116",
        "🇨🇴 2019 in Florencia, Caldas, Colombia / Source: https://www.facebook.com/photo?fbid=340950993251355&set=pcb.340953286584459",
        "2011 in United Kingdom (<https://www.youtube.com/watch?app=desktop&v=gk8O7MCeI2Q>)",
        "2007 in Sidney, Australia (https://www.flickr.com/photos/sebr/2051749701)",
        "🇷🇼 [2022/10/17](<https://www.facebook.com/photo/?fbid=10160245152912114&set=pcb.10160245153047114>) in [Kigali, Rwanda](<https://maps.app.goo.gl/2ehvo4VVYr9b3dD49>)",
        "🇹🇿 2014 in Gombe National Park, Tanzania / Source: https://www.vetstreet.com/our-pet-experts/google-street-view-lets-you-walk-with-jane-goodall",
        "🇱🇹 2013 in Kaunas, Lithuania / Source: https://www.15min.lt/naujiena/aktualu/lietuva/kauno-gatves-fotografuoja-google-maps-56-363361",
        "🇵🇪 2015 in Cuzco, Peru / Source: https://twitter.com/japonton/status/630835724703547393/photo/1",
        "🇪🇺 2012(?) in Europe /Source: https://petapixel.com/2012/06/06/google-street-view-has-snapped-20-petabytes-of-street-photos/",
        "🇯🇵 2010 in Taitō, Tokyo, Japan / Source: https://gigazine.net/gsc_news/en/20100107_street_view_car",
        "🇸🇪 2010 in Varberg, Halland County, Sweden / Source: https://commons.wikimedia.org/wiki/File:Google_Street_View_camera_car,_Varberg,_Sweden.jpg Location: https://maps.app.goo.gl/avzVY51ia4bHjDR67",
        "🇮🇱 2011 in [Yad Vashem holocaust remembrance center, Jerusalem, Israel](<https://maps.app.goo.gl/mPTTuBqopx52vrXBA>) / source: https://www.yadvashem.org/blog/google-street-view-trike-comes-to-yad-vashem.html",
        "🇯🇵 2009 in Japan / Source:<https://noriyuki.cocolog-nifty.com/blog/2009/04/google-4312.html>",
        "🇨🇦 2009 in Mississauga, Ontario, Canada / Source:<https://www.iphoneincanada.ca/2009/08/07/google-street-view-almost-in-canada/>"
    ]
        self.s = spotting()

    def test_all(self):
        for string in self.spottings:
            print(self.s.process_spotting(string))
            print("---")
        # print(self.s.regex_town)
    
if __name__ == '__main__':
    unittest.main()