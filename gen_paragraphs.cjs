const paragraphs = [
  {
    title: "1. A Winter Morning",
    content: "A winter morning is misty and cold. There is dense fog everywhere. Sometimes the fog is so dense that the sun rays cannot get through it. Everything looks hazy. Things at a distance can hardly be seen. The old and the poor suffer much from cold. They gather dried leaves and straw and make a fire to warm themselves. Children and old people bask in the sun when the sun peeps through the fog. Dew drops fall at night. When the morning sun shines, the dew drops look like glittering pearls on the grass. Farmers go to the field to work. A winter morning is highly enjoyable to the rich while it is painful to the poor."
  },
  {
    title: "2. Load Shedding",
    content: "Load shedding means the frequent suspension of the supply of electricity. It has become a regular affair in our country. It occurs when generation of power is less than the demand. It brings about a stand-still situation in our normal flow of life. Mills and factories, hospitals, and educational institutions are greatly hampered for load shedding. The students are the worst sufferers. They sit in the darkness with a candle during their study hours. Operations drop in the hospitals, causing immense miseries to the patients. The government should take immediate steps to set up more power plants to solve this problem."
  },
  {
    title: "3. Traffic Jam",
    content: "Traffic jam is a common affair in the big cities and towns of our country. It is one of the major problems of modern time. The causes of traffic jam are many. The rapid growth of population and the increasing number of vehicles are the main causes. The narrow roads and the lack of traffic police also contribute to it. Sometimes reckless driving and violation of traffic rules cause terrible traffic jams. As a result, people cannot reach their destinations in time. To solve this problem, spacious roads should be constructed. Above all, traffic rules should be strictly implemented."
  },
  {
    title: "4. A School Library",
    content: "A school library is a place where a huge collection of books is kept for reading. It is a part and parcel of an educational institution. Our school has a big library. It is housed in a separate building. There are lots of almirahs in it. The books are arranged according to their subjects. There is a wide reading room well-lighted and well-ventilated. We go there and read books during our leisure periods. Our librarian is a very nice man. He helps us to find out the proper books. A school library plays an important role in the realm of knowledge."
  },
  {
    title: "5. Tree Plantation",
    content: "Tree plantation means planting more and more trees. Trees are our best friends. They give us oxygen, food, and shelter. They also give us wood which we use for making furniture and houses. Trees play an important role in maintaining the ecological balance. They prevent soil erosion and save us from natural calamities like floods and cyclones. Without trees, our country will turn into a desert. June and July are the best time for tree plantation. We should plant more trees around our houses and on both sides of the roads."
  },
  {
    title: "6. Your Aim in Life",
    content: "Every man has an aim in life. A man without an aim is like a ship without a rudder. My aim in life is to become a good doctor. I have chosen this profession because it is a noble one. The people of our villages suffer much from various diseases and they die without proper medical treatment. So, I have decided to serve the poor villagers. After getting the MBBS degree, I shall go back to my village and set up a charitable dispensary. I shall dedicate my life to the service of the suffering humanity."
  },
  {
    title: "7. Environmental Pollution",
    content: "Environmental pollution means the contamination of our environment. The environment consists of air, water, and soil. These three elements are constantly being polluted. Air is polluted by smoke from mills, factories, and vehicles. Water is polluted by industrial wastes, chemicals, and human mismanagement. Soil is polluted by the excessive use of fertilizers and pesticides. Environmental pollution causes various diseases and poses a great threat to our existence. We should take serious steps to control environmental pollution and ensure a healthy life for our future generation."
  },
  {
    title: "8. A Book Fair",
    content: "A book fair is a fair where different types of books are displayed and sold. It has become very popular in our country. The biggest book fair of our country is the 'Ekushey Boi Mela'. It is held every year in February on the premises of the Bangla Academy. Hundreds of pavilions and stalls are set up. Men, women, and students flock to the fair. The whole area becomes noisy and festive. People buy their favorite books from the fair. A book fair creates a reading habit among the people and spreads the light of knowledge."
  },
  {
    title: "9. Mobile Phone",
    content: "A mobile phone is an important invention of modern science. It has brought a revolution in the field of communication. We can communicate with the people of distant places within a second. It is like a mini-computer in our pocket. We can capture photos, play games, browse the internet, and send text messages. However, it has some demerits too. Some people misuse it. Teenagers especially waste their valuable time playing games or chatting. Despite its demerits, a mobile phone is a very useful device if it is used properly."
  },
  {
    title: "10. Price Hike",
    content: "Price hike means the unusual increase in the prices of daily commodities. It is a common problem in our country. The main causes of price hike are hoarding, black marketing, and syndicates. Sometimes natural disasters and shortage of supply also cause price hike. Because of price hike, the lower and middle-class people suffer much. They cannot buy their daily necessities. The government should take strict measures to control the price hike. The hoarders and black marketers must be punished to stabilize the market."
  },
  {
    title: "11. Deforestation",
    content: "Deforestation means cutting down trees in large numbers. The causes of deforestation are many. People cut down trees for fuel, furniture, and housing. Due to deforestation, the ecological balance is being continuously disturbed. Global warming is the immediate result of deforestation. It leads to natural disasters like floods, droughts, and cyclones. If we destroy trees at random, one day the country will turn into a desert. Therefore, we should stop deforestation and plant more trees to save our environment."
  },
  {
    title: "12. Padma Multipurpose Bridge",
    content: "The Padma Multipurpose Bridge is the biggest infrastructure project in the history of Bangladesh. It is built over the river Padma. The length of the bridge is 6.15 km. It connects the southern part of the country with the capital city, Dhaka. It is a two-level steel truss bridge. The upper level is for vehicular traffic, and the lower level is for the railway. This bridge plays a vital role in our economy, trade, and commerce. It has reduced travel time and brought a revolutionary change in communication."
  },
  {
    title: "13. Food Adulteration",
    content: "Food adulteration means the addition of harmful chemicals or mixing low-quality substances with food items. It has become a severe problem in our country. Dishonest businessmen add poisonous chemicals and colors to food just to make a high profit. Formalin, carbide, and other toxic chemicals are widely used in fruits, vegetables, and fishes. Consuming adulterated food causes fatal diseases like cancer, kidney failure, and liver damage. The government should strictly enforce laws to eradicate food adulteration and ensure safe food for all."
  },
  {
    title: "14. Empowering Women",
    content: "Empowerment of women means enabling women to have control over their own lives and making them independent economically and socially. Women constitute half of our total population. Without ensuring their proper rights, no nation can prosper. In the past, women were confined to the four walls of the house. But now, women are working in every sector side by side with men. The government has taken various steps for female education. Women's empowerment is the key to national development."
  },
  {
    title: "15. A Rainy Day",
    content: "A rainy day is a day when it rains continuously all day long. The sky remains cloudy, and the sun cannot be seen. Sometimes it rains heavily, and sometimes it drizzles. Roads become muddy and slippery. People cannot easily go out of their houses without an umbrella. The day laborers and the poor suffer a lot as they cannot go out to earn their living. But a rainy day is a day of joy for the children. They love to play in the rain and make paper boats. Generally, people like to stay indoors and enjoy special foods like khichuri."
  }
];

const fs = require('fs');

let out = 'import { WordItem } from "./vocabularyData";\n\nexport const HSC_PARAGRAPHS: WordItem[] = [\n';

paragraphs.forEach((p, idx) => {
  out += `  {
    id: "hsc_para_${idx+1}",
    word: ${JSON.stringify(p.title)},
    language: "english",
    category: "paragraph",
    meaning: ${JSON.stringify(p.content)},
    synonyms: [],
    antonyms: []
  },\n`;
});

out += '];\n';

fs.writeFileSync('src/data/hscParagraphs.ts', out);
console.log('Done!');
