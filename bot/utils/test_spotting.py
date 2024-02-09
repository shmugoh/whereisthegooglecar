import unittest
from spotting import spotting

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
        """
    ]
        self.s = spotting()

    def test_all(self):
        for string in self.spottings:
            print("Country:", self.s.get_country(string))
            print("Service:", self.s.get_service(string))
            print("Date:", self.s.get_date(string))
            print("Town:", self.s.get_town(string))            
            print("Source:", self.s.get_source(string))
            print("Location:", self.s.get_location(string))
            print("---")

if __name__ == '__main__':
    unittest.main()