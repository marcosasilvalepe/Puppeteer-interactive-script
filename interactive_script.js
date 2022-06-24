const mysql = require('mysql');
//YOU SHOULD CHANGE DATABASE ACCESS HERE !!!
const conn = mysql.createPool({ 
    connectionLimit: 15, 
    host: "localhost", 
    user: "root", 
    password: "", 
    database: "scraper" 
});

const userInput = require('wait-for-user-input');
const puppeteer = require('puppeteer');
const puppeteerOptions = { headless: false /*** default is true ***/ /*, args: ['--proxy-server=127.0.0.1:24000']*/ }
const main_url = "clients_hidden_url";

/*************************************** GENERAL FUNCTIONS *************************************/
const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }

const todays_date = () => {
    const 
    now = new Date(),
    year = now.getFullYear(),
    month = (now.getMonth() + 1 < 10) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1,
    day = (now.getDate() < 10) ? '0' + now.getDate() : now.getDate(),
    hour = now.toLocaleString('ro-RO').split(' ')[1];
    return year + '-' + month + '-' + day + ' ' + hour;
}

const update_user_coins = (user, coins) => {
    return new Promise((resolve, reject) => {
        const now = todays_date();
        conn.query(`
            UPDATE users 
            SET 
                updated=1,
                coins=${parseInt(coins)},
                last_update=${conn.escape(now)}
            WHERE user=${user};
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve()
        })
    })
}

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
/*************************************** CREATE ACCOUNT FUNCTIONS *************************************/
const names = [
    {name: "Adam", gender: "male"},{name: "Adi 3", gender: "male"},{name: "Adrian", gender: "male"},{name: "Albert", gender: "male"},{name: "Alex", gender: "male"},{name: "Alexandru", gender: "male"},{name: "Alin", gender: "male"},{name: "Andrei", gender: "male"},{name: "Anghel", gender: "male"},{name: "Anton", gender: "male"},{name: "Antoniu", gender: "male"},{name: "Apostol", gender: "male"},{name: "Atanase", gender: "male"},{name: "Atanasie", gender: "male"},{name: "Augustin", gender: "male"},{name: "Aurel", gender: "male"},{name: "Aurică", gender: "male"},{name: "Beniamin", gender: "male"},
    {name: "Bogdan", gender: "male"},{name: "Carol 2", gender: "male"},{name: "Cătălin", gender: "male"},{name: "Cezar", gender: "male"},{name: "Ciprian", gender: "male"},{name: "Claudiu", gender: "male"},{name: "Codrin", gender: "male"},{name: "Codruț", gender: "male"},{name: "Constantin", gender: "male"},{name: "Cornel", gender: "male"},{name: "Corneliu", gender: "male"},{name: "Cosmin", gender: "male"},{name: "Costache", gender: "male"},{name: "Costel", gender: "male"},{name: "Costică", gender: "male"},{name: "Costin", gender: "male"},{name: "Cristi", gender: "male"},{name: "Cristian", gender: "male"},
    {name: "Dacian", gender: "male"},{name: "Damian", gender: "male"},{name: "Dan 2", gender: "male"},{name: "Daniel", gender: "male"},{name: "Dănuț", gender: "male"},{name: "Darius", gender: "male"},{name: "David", gender: "male"},{name: "Decebal", gender: "male"},{name: "Denis", gender: "male"},{name: "Dezideriu", gender: "male"},{name: "Dinu", gender: "male"},{name: "Dionisie", gender: "male"},{name: "Dorian", gender: "male"},{name: "Dorin", gender: "male"},{name: "Dorinel", gender: "male"},{name: "Doru", gender: "male"},{name: "Dragomir", gender: "male"},{name: "Dragos", gender: "male"},
    {name: "Dragoș", gender: "male"},{name: "Dumitru", gender: "male"},{name: "Eduard", gender: "male"},{name: "Emanoil", gender: "male"},{name: "Emanuel", gender: "male"},{name: "Emil", gender: "male"},{name: "Emilian", gender: "male"},{name: "Eugen", gender: "male"},{name: "Eusebiu", gender: "male"},{name: "Fabian", gender: "male"},{name: "Fane", gender: "male"},{name: "Felix", gender: "male"},{name: "Filimon", gender: "male"},{name: "Filip", gender: "male"},{name: "Flaviu", gender: "male"},{name: "Flavius", gender: "male"},{name: "Florentin", gender: "male"},{name: "Florian", gender: "male"},
    {name: "Florin", gender: "male"},{name: "Gabriel", gender: "male"},{name: "Gavril", gender: "male"},{name: "George", gender: "male"},{name: "Ghenadie", gender: "male"},{name: "Gheorghe", gender: "male"},{name: "Ghiță", gender: "male"},{name: "Grigore", gender: "male"},{name: "Haralamb", gender: "male"},{name: "Horațiu", gender: "male"},{name: "Horea", gender: "male"},{name: "Horia", gender: "male"},{name: "Iacob", gender: "male"},{name: "Iancu", gender: "male"},{name: "Ieronim", gender: "male"},{name: "Ilie", gender: "male"},{name: "Ioan", gender: "male"},{name: "Ion 1", gender: "male"},
    {name: "Ionel", gender: "male"},{name: "Ionuț", gender: "male"},{name: "Iosif", gender: "male"},{name: "Isac", gender: "male"},{name: "Iulian", gender: "male"},{name: "Iuliu", gender: "male"},{name: "Ivan", gender: "male"},{name: "Ladislau", gender: "male"},{name: "Laurențiu", gender: "male"},{name: "Lazăr", gender: "male"},{name: "Leonard", gender: "male"},{name: "Liviu", gender: "male"},{name: "Luca 1", gender: "male"},{name: "Lucian", gender: "male"},{name: "Manuel", gender: "male"},{name: "Marcel", gender: "male"},{name: "Marian 2", gender: "male"},{name: "Marin", gender: "male"},
    {name: "Marius", gender: "male"},{name: "Martin", gender: "male"},{name: "Matei", gender: "male"},{name: "Mihai", gender: "male"},{name: "Mihail", gender: "male"},{name: "Mihăiță", gender: "male"},{name: "Mircea", gender: "male"},{name: "Miron 1", gender: "male"},{name: "Mitică", gender: "male"},{name: "Neculai", gender: "male"},{name: "Nelu", gender: "male"},{name: "Nicolae", gender: "male"},{name: "Nicu", gender: "male"},{name: "Nicușor", gender: "male"},{name: "Octavian", gender: "male"},{name: "Ovidiu", gender: "male"},{name: "Paul", gender: "male"},{name: "Petre", gender: "male"},
    {name: "Petrică", gender: "male"},{name: "Petru", gender: "male"},{name: "Petruț", gender: "male"},{name: "Pompiliu", gender: "male"},{name: "Radu", gender: "male"},{name: "Rafael", gender: "male"},{name: "Rareș", gender: "male"},{name: "Raul", gender: "male"},{name: "Răzvan", gender: "male"},{name: "Remus", gender: "male"},{name: "Robert", gender: "male"},{name: "Romeo", gender: "male"},{name: "Romulus", gender: "male"},{name: "Sandu", gender: "male"},{name: "Sebastian", gender: "male"},{name: "Serghei", gender: "male"},{name: "Sergiu", gender: "male"},{name: "Silviu", gender: "male"},
    {name: "Simion", gender: "male"},{name: "Simon 1", gender: "male"},{name: "Sorin", gender: "male"},{name: "Stan 2", gender: "male"},{name: "Ștefan", gender: "male"},{name: "Adela", gender: "female"},{name: "Adelina", gender: "female"},{name: "Adina 2", gender: "female"},{name: "Adriana", gender: "female"},{name: "Alexandra", gender: "female"},{name: "Alina", gender: "female"},{name: "Amalia", gender: "female"},{name: "Ana", gender: "female"},{name: "Anamaria", gender: "female"},{name: "Anastasie", gender: "female"},{name: "Anca", gender: "female"},{name: "Ancuța", gender: "female"},
    {name: "Andra 2", gender: "female"},{name: "Andrada", gender: "female"},{name: "Andreea", gender: "female"},{name: "Angela", gender: "female"},{name: "Angelica", gender: "female"},{name: "Ani 1", gender: "female"},{name: "Anișoara", gender: "female"},{name: "Antonia", gender: "female"},{name: "Aurelia", gender: "female"},{name: "Aurica", gender: "female"},{name: "Aurora", gender: "female"},{name: "Beatrice", gender: "female"},{name: "Bianca", gender: "female"},{name: "Bogdana", gender: "female"},{name: "Brândușa", gender: "female"},{name: "Camelia", gender: "female"},
    {name: "Carmen", gender: "female"},{name: "Casandra", gender: "female"},{name: "Cătălina", gender: "female"},{name: "Catina", gender: "female"},{name: "Catrinel", gender: "female"},{name: "Cecilia", gender: "female"},{name: "Cezara", gender: "female"},{name: "Clara", gender: "female"},{name: "Claudia", gender: "female"},{name: "Constanța", gender: "female"},{name: "Constantina", gender: "female"},{name: "Corina", gender: "female"},{name: "Cornelia", gender: "female"},{name: "Cosmina", gender: "female"},{name: "Crina", gender: "female"},{name: "Cristiana", gender: "female"},
    {name: "Cristina", gender: "female"},{name: "Daciana", gender: "female"},{name: "Dana 1", gender: "female"},{name: "Daniela", gender: "female"},{name: "Daria", gender: "female"},{name: "Delia 1", gender: "female"},{name: "Demetra", gender: "female"},{name: "Denisa", gender: "female"},{name: "Diana", gender: "female"},{name: "Doina", gender: "female"},{name: "Dorina 1", gender: "female"},{name: "Dumitra", gender: "female"},{name: "Ecaterina", gender: "female"},{name: "Elena", gender: "female"},{name: "Elisabeta", gender: "female"},{name: "Eliza", gender: "female"},
    {name: "Emanuela", gender: "female"},{name: "Emilia", gender: "female"},{name: "Estera", gender: "female"},{name: "Eugenia", gender: "female"},{name: "Eva", gender: "female"},{name: "Felicia", gender: "female"},{name: "Flavia", gender: "female"},{name: "Florentina", gender: "female"},{name: "Floriana", gender: "female"},{name: "Florina", gender: "female"},{name: "Gabi", gender: "female"},{name: "Gabriela", gender: "female"},{name: "Gavrila", gender: "female"},{name: "Georgeta", gender: "female"},{name: "Georgiana", gender: "female"},{name: "Ileana", gender: "female"},
    {name: "Ilinca", gender: "female"},{name: "Ioana", gender: "female"},{name: "Iolanda", gender: "female"},{name: "Ionela", gender: "female"},{name: "Irina", gender: "female"},{name: "Isabela", gender: "female"},{name: "Isabella", gender: "female"},{name: "Iulia", gender: "female"},{name: "Iuliana", gender: "female"},{name: "Larisa", gender: "female"},{name: "Laura", gender: "female"},{name: "Lavinia", gender: "female"},{name: "Lenuța", gender: "female"},{name: "Liana", gender: "female"},{name: "Lidia", gender: "female"},{name: "Ligia", gender: "female"},{name: "Liliana", gender: "female"},
    {name: "Livia 1", gender: "female"},{name: "Loredana", gender: "female"},{name: "Lorena 1", gender: "female"},{name: "Lucia", gender: "female"},{name: "Luciana", gender: "female"},{name: "Luiza", gender: "female"},{name: "Luminița", gender: "female"},{name: "Mădălina", gender: "female"},{name: "Magda", gender: "female"},{name: "Magdalena", gender: "female"},{name: "Manuela", gender: "female"},{name: "Marcela", gender: "female"},{name: "Margareta", gender: "female"},{name: "Maria", gender: "female"},{name: "Mariana", gender: "female"},{name: "Maricica", gender: "female"},
    {name: "Marilena", gender: "female"},{name: "Marina", gender: "female"},{name: "Marinela", gender: "female"},{name: "Marta", gender: "female"},{name: "Melania", gender: "female"},{name: "Mihaela", gender: "female"},{name: "Minodora", gender: "female"},{name: "Mirela", gender: "female"},{name: "Miruna", gender: "female"},{name: "Monica", gender: "female"},{name: "Narcisa", gender: "female"},{name: "Natalia", gender: "female"},{name: "Nicoleta", gender: "female"},{name: "Noemi", gender: "female"},{name: "Oana", gender: "female"},{name: "Olga", gender: "female"},
    {name: "Olimpia", gender: "female"},{name: "Otilia", gender: "female"},{name: "Ovidia", gender: "female"},{name: "Ozana", gender: "female"},{name: "Paula", gender: "female"},{name: "Petronela", gender: "female"},{name: "Rahela", gender: "female"},{name: "Raluca", gender: "female"},{name: "Ramona", gender: "female"},{name: "Rebeca", gender: "female"},{name: "Renata", gender: "female"},{name: "Rodica", gender: "female"},{name: "Roxana", gender: "female"},{name: "Rozalia", gender: "female"},{name: "Ruxandra", gender: "female"},{name: "Sabina", gender: "female"},
    {name: "Sanda 1", gender: "female"},{name: "Sandra", gender: "female"},{name: "Sara", gender: "female"},{name: "Silvia", gender: "female"},{name: "Simona", gender: "female"},{name: "Sofia", gender: "female"},{name: "Sonia", gender: "female"},{name: "Sorina", gender: "female"},{name: "Ștefana", gender: "female"},{name: "Ștefania", gender: "female"}, {name: "Stelian", gender: "male"},{name: "Teodor", gender: "male"},{name: "Teofil", gender: "male"},{name: "Theodor", gender: "male"},{name: "Tiberiu", gender: "male"},{name: "Timotei", gender: "male"},{name: "Toma 2", gender: "male"},
    {name: "Traian", gender: "male"},{name: "Tudor 2", gender: "male"},{name: "Valentin", gender: "male"},{name: "Valerian", gender: "male"},{name: "Valeriu", gender: "male"},{name: "Vali", gender: "male"},{name: "Vasile", gender: "male"},{name: "Vasilică", gender: "male"},{name: "Veaceslav", gender: "male"},{name: "Victor", gender: "male"},{name: "Viorel", gender: "male"},{name: "Virgil", gender: "male"},{name: "Virgiliu", gender: "male"},{name: "Vlad", gender: "male"}, {name: "Stela", gender: "female"},{name: "Steliana", gender: "female"},{name: "Tatiana", gender: "female"},
    {name: "Teodora", gender: "female"},{name: "Tereza", gender: "female"},{name: "Valentina", gender: "female"},{name: "Valeria", gender: "female"},{name: "Vasilica", gender: "female"},{name: "Vera 1", gender: "female"},{name: "Veronica", gender: "female"},{name: "Victoria", gender: "female"},{name: "Violeta", gender: "female"},{name: "Viorela", gender: "female"},{name: "Viorica", gender: "female"},{name: "Virginia", gender: "female"}
]

const surnames = [
    "Popa","Popescu","Pop","Radu","Dumitru","Stan","Stoica","Gheorghe","Matei","Rusu","Mihai","Ciobanu","Constantin","Marin","Ionescu","Florea","Ilie","Toma","Stanciu","Munteanu","Vasile","Oprea","Tudor","Sandu","Moldovan","Ion","Ungureanu","Dinu","Andrei","Barbu","Serban","Neagu","Cristea","Anghel","Lazar","Dragomir","Enache","Badea","Stefan","Vlad","Mocanu","Iordache","Coman","Cojocaru","Grigore","Voicu","Dobre","Petre","Nagy","Lupu","Lungu","Ivan","Ene","Preda","Roman","Ionita","Iancu","Nicolae","Balan","Manea","Nistor","Stoian","Avram","Pavel","Simion","Rus","Iacob","Bucur","Luca","Olteanu","Filip",
    "Tanase","Costea","Craciun","David","Stancu","Dumitrescu","Marcu","Muresan","Diaconu","Nedelcu","Rotaru","Baciu","Szabo","Zaharia","Costache","Alexandru","Suciu","Dan","Anton","Bogdan","Rosu","Moraru","Toader","Paraschiv","Sava","Nica","Kovacs","Nita","Muntean","Constantinescu","Albu","Cretu","Calin","Olaru","Varga","Georgescu","Dragan","Popovici","Ardelean","Dumitrache","Chiriac","Petcu","Miron","Dima","Mihalache","Zamfir","Paun","Marinescu","Petrescu","Niculae","Ghita","Neacsu","Soare","Moise","Bratu","Damian","Ursu","Croitoru","Istrate","Sirbu","Pascu","Savu","Manole","Dinca","Apostol","Micu",
    "Stroe","Nitu","Draghici","Crisan","Tudorache","Cozma","Grosu","Rosca","Oancea","Ignat","Radulescu","Adam","Mihaila","Sima","Irimia","Molnar","Necula","Ciocan","Manolache","Balint","Grecu","Burlacu","Nastase","Macovei","Pirvu","Turcu","Simon","Kiss","Marian","Chirila","Panait","Cazacu","Teodorescu","Trandafir","Militaru","Oltean","Stanescu","Farcas","Negru","Maxim","Toth","Gabor","Florescu","Dumitrascu","Pintilie","Tamas","Morar","Cosma","Visan","Chirita","Danciu","Dogaru","Gavrila","Tudose","Voinea","Dascalu","Moldoveanu","Lazăr","Pana","Mihalcea","Patrascu","Negrea","Trif","Mircea","Ichim","Alexe",
    "Grigoras","Costin","Iliescu","Bejan","Nechita","Mirea","Neagoe","Cucu","Puiu","Musat","Prodan","Banu","Stefanescu","Olariu","Ispas","Szekely","Blaga","Danila","Trifan","Gal","Groza","Bota","Boboc","Maftei","Vaduva","Vasilescu","Gherman","Szasz","Antal","Petrea","Martin","Cornea","Ganea","Gheorghiu","Chivu","Pintea","Staicu","Niculescu","Tănase","Burcea","Solomon","Botezatu","Miu","Iorga","Sabau","Nicola","Duta","Pal","Alexa","Cirstea","Man","Udrea","Aldea","Cojocariu","Crăciun","Rotariu","Negoita","Ciobotaru","Paduraru","Biro","Leonte","Murariu","Covaci","Fodor","Pricop","Dragu","Diaconescu","Bodea",
    "Milea","Pasca","Carp","Catana","Onofrei","Petrache","Busuioc","Codreanu","Moga","Buzatu","Vasiliu","Chis","Tomescu","Jianu","Dragoi","Tataru","Ghinea","Alecu","Iosif","Sandor","Tanasa","Epure","Şerban","Scarlat","Dobrin","Radoi","Gheorghita","Filimon","Veres","Savin","Iordan","Nae","Timofte","Buta","Duma","Ştefan","Călin","Achim","Peter","Boca","Mitroi","Dumitriu","Mazilu","Vieru","Bunea","Butnaru","Ifrim","Cristian","Gherasim","Mitu","Ardeleanu","Nechifor","Chira","Feraru","Balazs","Cazan","Giurgiu","Spiridon","Marginean","Vintila","Palade","Farkas","Tofan","Demeter","Scurtu","Chelaru","Apetrei",
    "Vasilache","Șerban","Gradinaru","Nicoara","State","Oros","Dicu","Ivascu","Timis","Marton","Deaconu","Robu","Pantea","Banica","Drăgan","Dobrescu","Ciuca","Mateescu","Apostu","Nicolescu","Deac","Birsan","Mitrea","Spataru","Rizea","Nemes","Szilagyi","Morariu","Silaghi","Păun","Lucaci","Vaida","Cercel","Cernat","Nedelea","Ursache","Grigorescu","Ciurea","Boros","Ștefan","Novac","Fratila","Bălan","Duca","Iuga","Andronache","Moisa","Ioan","Buda","Neamtu","Blaj","Cristescu","Faur","Bujor","Grama","Alexandrescu","Dorobantu","Kis","Surdu","Sas","Ioniţă","Puscasu","Lacatus","Predescu","Vladu","Orban","Mocan",
    "Maris","Barbulescu","Puscas","Postolache","Chiorean","Raducanu","Mihailescu","Minea","Ilies","Nicula","Sîrbu","Gherghe","Simionescu","Stanca","Jurca","Gavril","Laszlo","Bostan","Mitran","Tache","Sipos","Marica","Andronic","Arsene","Ilinca","Tatar","Ungur","Dragos","Mititelu","Rad","Darie","Maier","Patru","Balaban","Neculai","Axinte","Opris","Bica","Marc","Mihali","Ionascu","Chitu","Petrisor","Plesa","Balog","Buga","Raileanu","Banciu","Raicu","Luchian","Schiopu","Manta","Matache","Buliga","Melinte","Dobra","Chiru","Dincă","Vrabie","Badescu","Horvath","Ioniță","Mares","Gergely","Nan","Sandru","Sabou",
    "Miclea","Obreja","Fazakas","Todea","Gligor","Pap","Enea","Lefter","Ciubotariu","Vulpe","Anca","Ciubotaru","Sarbu","Ioana","Tatu","Lupascu","Kelemen","Jakab","Todoran","Vlaicu","Dobos","Balogh","Gaspar","Todor","Ban","Oprescu","Fulop","Ionica","Poenaru","Samoila","Badiu","Voica","Balea","Neag","Zanfir","Mihăilă","Panaite","Spinu","Muraru","Vlasceanu","Pruteanu","Calota","Szakacs","Pîrvu","Albert","Lukacs","Cadar","Lascu","Dutu","Rada","Barabas","Dragnea","Antonescu","Ana","Amariei","Vizitiu","Ureche","Andreescu","Bran","Butnariu","Drăghici","Gyorgy","Pacurar","Vilcu","Trofin","Stamate","Danci","Nicu",
    "Mirica","Baicu","Bartha","Bercea","Năstase","Isac","Andries","Torok","Enescu","Rădulescu","Olah","Vancea","Barna","Precup","Frunza","Roşu","Ivanov","Cruceru","Szocs","Dina","Onea","Olar","Velicu","Chirica","Demian","Papp","Trifu","Mincu","Mureşan","Ciornei","Ababei","Bara","Lica","Dinescu","Gruia","Fekete","Stana","Morosan","Gliga","Lup","Ristea","Condrea","Deak","Cimpean","Loghin","Muscalu","Andreica","Stanica","Csiki","Gavrilă","Ferencz","Kocsis","Trusca","Cismaru","Sanda","Balasa","Ambrus","Stanila","Gaina","Doroftei","Dunca","Dascălu","Raducan","Tudoran","Creţu","Stirbu","Morosanu","Paunescu",
    "Purice","Iosub","Mutu","Niţă","Padurariu","Cioara","Mezei","Papuc","Acatrinei","Pană","Lorincz","Chirilă","Dumbrava","Rotar","Andras","Paval","Surugiu","Mihu","Paul","Borza","Bordea","Oana","Szabó","Anghelescu","Lazarescu","Bulai","Cernea","Capatina","Lixandru","Tiron","Văduva","Raducu","Ilea","Kovács","Pascal","Iftime","Mitrache","Codrea","Mate","Androne","Botez","Roșu","Maria","Serbanescu","Dragne","Dedu","Fabian","Macarie","Onica","Tomoiaga","Baba","Bud","Chiper","Miklos","Bordeianu","Stoicescu","Gherghina","Ratiu","Manu","Corbu","Ionel","Goga","Bors","Vieriu","Coca","Lakatos","Ciorba","Gherghel",
    "Stoican","Buzea","Nuta","Costan","Crețu","Tanasie","Galan","Stinga","Mardare","Fieraru","Nicolau","Frincu","Dănilă","Abrudan","Ciocoiu","Mihaly","Burca","Postelnicu","Bejenaru","Baluta","Bulgaru","Gorgan","Mureșan","Leu","Erdei","Neacşu","Bora","Guta","Safta","Petrica","Dediu","Sasu","Kadar","Stănescu","Catrina","Cîrstea","Hanganu","Botea","Vacaru","Ghiţă","Jurj","Fechete","Cimpeanu","Benedek","Belu","Manda","Leca","Tanasescu","Nanu","Furdui","Radut","Ursachi","Lepadatu","Nichita","Barsan","Bursuc","Chelariu","Turcanu","Tita","Stuparu","Iovan","Sandulescu","Vicol","Daraban","Pascariu","Neacșu","Dobrea",
    "Ghiță","Goia","Stratulat","Cocos","Murgu","Antohi","Pricope","Tugui","Vass","Hutanu","Jipa","Gavrilescu","Mihoc","Coste","Jitaru","Truta","Prisacariu","Burtea","Bot","Voiculescu","Ungurean","Marina","Balla","Virlan","Porumb","Roşca","Schipor","Eftimie","Mitrofan","Feier","Stroia","Pirvan","Motoc","Eremia","Cristache","Margarit","Aron","Condurache","Floarea","Manciu","Nastasa","Horvat","Zamfirescu","Covrig","Vasiu","Benchea","Urs","Platon","Vornicu","Prisecaru","Butoi","Păduraru","Datcu","Stef","Velea","Budeanu","Graur","Enciu","Niță","Mogos","Comsa","Vesa","Lita","Petrut","Sora","Petric","Stroie",
    "Craciunescu","Oprisan","Stroescu","Amza","Pruna","Rata","Gaman","Mare","Parvu","Tincu","Kerekes","Vrinceanu","Mustata","Irimescu","Pirvulescu","Denes","Curca","Manescu","Barta","Panainte","Avramescu","Mihut","Timar","Uta","Borcea","Zota","Voda","Kozma","Capraru","Cuc","Golea","Dragusin","Tutuianu","Danaila","Ciortan","Mathe","Ariton","Feher","Florian","Mot","Dragut","Stoia","Moroianu","Angheluta","Balas","Andone","Pascalau","Ticu","Campean","Tinca","Crişan","Floroiu","Ruse","Bordei","Agache","Creanga","Lung","Oniga","Suteu","Ciolan","Zidaru","Buzdugan","Nițu","Lucaciu","Petrovici","Mladin","Nutu",
    "Cioban","Nicolaescu","Boicu","Covaciu","Baltag","Iamandi","Asaftei","Hriscu","Lacatusu","Raduta","Corduneanu","Chirea","Sabo","Furtuna","Podaru","Galea","Burciu","Buruiana","Vişan","Hagiu","Tabacaru","Mic","Grad","Gogu","Niţu","Mates","Voinescu","Moldovanu","Socol","Traistaru","Leahu","Racz","Din","Benea","Keresztes","Breazu","Herman","Manolescu","Bratosin","Bura","Gurau","Iftimie","Hosu","Cojanu","Balica","Bodnar","Negrila","Ilyes","Balaj","Blanaru","Taranu","Mihaescu","Hotea","Matyas","Calinescu","Incze","Cotoi","Mateiu","Pandele","Haiduc","Cojoc","Sabău","Giurca","Bucataru","Vatamanu","Chereches",
    "Juravle","Holban","Bacanu","Tripon","Pascaru","Anghelache","Scutaru","Tanko","Dulgheru","Bala","Borbely","Samson","Ciuta","Airinei","Mandache","Vilceanu","Gorea","Chirca","Culea","Grigoriu","Santa","Oprean","Mitea","Laza","Ghica","Roșca","Baboi","Nacu","Neaga","Gutu","Horga","Bejinariu","Grigorie","Chiran","Juganaru","Vincze","Geana","Balaci","Fulga","Valeanu","Pelin","Pantazi","Minca","Petraru","Ciuraru","Ancuta","Taran","Purcaru","Rădoi","Lazea","Zaharie","Cimpoeru","Neculae","Chindris","Proca","Mitrica","Ciolacu"
]

const get_new_numbers = () => {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT number FROM new_phones;
        `, (error, results, fields) => {
            if (error) return reject(error);
            if (results.length === 0) console.log('No new numbers to create accounts.');
            return resolve(results);
        })
    })
}

const check_number_in_database = phone_number => {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT user FROM users WHERE user=${conn.escape(phone_number)};
        `, (error, results, fields) => {
            if (error) return reject(error);
            if (results.length === 0) return resolve(true);
            return resolve(false);
        })
    })
}

const save_created_user = (user, insert) => {
    return new Promise((resolve, reject) => {
        const now = todays_date();
        const query = (insert) ? `
            INSERT INTO users (
                active, name, surname, user, password, email, code, created, coins
            )
            VALUES (
                1, 
                '${user.name}', 
                '${user.surname}', 
                '${user.user}', 
                '${user.password}', 
                '${user.email}', 
                '${user.code}', 
                '${now}', 
                0
            );
        ` : `
            UPDATE users
            SET 
                status=1,
                name='${user.name}',
                surname='${user.surname}',
                password='${user.password}',
                email='${user.email}',
                code='${user.code}',
                created='${now}',
                coins=0
            WHERE user='${user.user}';
        `;
        conn.query(query, (error, results, fields) => {
            if (error) return reject(error);
            return resolve();
        })
    })
}

const check_email = email => {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT id FROM users WHERE email='${email}';
        `, (error, results, fields) => {
            if (error) return reject(error);
            if (results.length === 0) return resolve(true);
            return resolve(false);
        })
    })
}

const delete_number_from_database = phone_number => {
    return new Promise((resolve, reject) => {
        conn.query(`
            DELETE FROM new_phones WHERE number=${conn.escape(phone_number)};
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve();
        })
    })
}

const create_account = phone_number => {
    return new Promise(async (resolve, reject) => {
        try {

            //GENERATE RANDOM EMAIL THAT ISNT' IN THE DATABASE
            let email;
            while (true) {
                email = (Math.random() + 1).toString(36).substring(4) + '@blfz.eu';
                if (check_email(email)) break;
            }

            const 
            first_name_index = randomInt(0, names.length),
            new_user = {
                name: names[first_name_index].name.split(' ')[0],
                surname: surnames[randomInt(0, surnames.length)],
                gender: names[first_name_index].gender, 
                user: phone_number,
                password: 'Youn!v3rs3',
                email: email
            }

            console.log('\r\nCreating account for:', new_user, '\r\n');

            const browser = await puppeteer.launch(puppeteerOptions); // default is true
            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36');

            console.log(`Loading main site.`);
            await page.goto(main_url, { waitUntil: 'networkidle0', timeout: 60000 });
            
            const frameHandle = await page.waitForSelector('iframe.login__iframe');
            const iframe = await frameHandle.contentFrame();
            console.log('iframe loaded');

            //ACCEPT COOKIES
            await page.waitForSelector('form.form-cookie.ng-untouched div.cta > button:last-child');
            await page.click('form.form-cookie.ng-untouched div.cta > button:last-child');
            console.log('Cookies accepted');

            await delay(2500);

            const wait_for_loader = async () => {
                await new Promise(async (resolve1, reject) => {
                    try {
                        await iframe.evaluate(async () => {
                            await new Promise(async resolve2 => {
                                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                const wait_for_loader = () => {
                                    return new Promise(async resolve3 => {
                                        const loader = document.querySelector('.component--preloader--youniverse_new.component--preloader');
                                        while (!loader.classList.contains('ng-hide')) { await delay(20); }
                                        console.log('finished waiting!!!') 
                                        return resolve3();
                                    })
                                }
                                await wait_for_loader();
                                return resolve2();
                            })
                        });
                        return resolve1();
                    } catch(error) { return reject(error) }
                })
            }

            //WAIT FOR LOADER TO BE HIDDEN
            await iframe.waitForSelector('.component--preloader--youniverse_new.component--preloader');
            await wait_for_loader();

            //CLICK ON ROMANIA
            await iframe.waitForSelector(`div.form-login .ctas a.btn-login.btn-auth[ng-click="selectCountry('ro')"]`);
            await delay(500);
            await iframe.click(`div.form-login .ctas a.btn-login.btn-auth[ng-click="selectCountry('ro')"]`);
            console.log('Clicked on Romania');

            //WAIT FOR LOADER TO BE HIDDEN
            await wait_for_loader();
            
            //ACCEPT TERMS
            await iframe.waitForSelector(`.ng-scope .lg-wrapper.disclaimer-wrapper.ng-scope .submit-container > a.btn-login[href="#/login"]`);
            await delay(500);
            await iframe.click(`.ng-scope .lg-wrapper.disclaimer-wrapper.ng-scope .submit-container > a.btn-login[href="#/login"]`);
            console.log('Terms accepted');

            //WAIT FOR LOADER TO BE HIDDEN
            await wait_for_loader();

            //LOGIN DATA -> USER
            await iframe.waitForSelector('#input-login-telefon');
            await iframe.waitForSelector('button.btn-login[ng-click="checkPhone()"]');
            await iframe.focus('#input-login-telefon');
            await page.keyboard.type(new_user.user);
            await delay(500);
            await iframe.click('button.btn-login[ng-click="checkPhone()"]');
            console.log('User entered correctly');

            //WAIT FOR LOADER TO BE HIDDEN
            await delay(300);
            await wait_for_loader();

            //NEW USER SURNAME
            await iframe.waitForSelector('#lastname_inp');
            await iframe.focus('#lastname_inp');
            await page.keyboard.type(new_user.surname);
            await page.keyboard.press('Tab');

            //NEW USER FIRST NAME
            await page.keyboard.type(new_user.name);
            await page.keyboard.press('Tab');

            //NEW USER EMAIL
            await page.keyboard.type(new_user.email);

            //BIRTH DAY
            console.log('Filling birth day');
            const random_day = randomInt(1, 28).toString();
            await iframe.select('select[ng-model="tempData.birthdate.day"]', random_day);

            //BIRTH MONTH
            console.log('Filling birth month');
            const this_month = new Date().getMonth() + 1;
            await iframe.select('select[ng-model="tempData.birthdate.month"]', this_month.toString());

            //BIRTH YEAR
            console.log('Filling birth year');
            await iframe.select('select[ng-model="tempData.birthdate.year"]', `number:${randomInt(1980, 2000)}`);

            //CHOOSE GENDER
            console.log('Choosing gender');
            const gender = new_user.gender;
            await iframe.evaluate(gender => {
                if (gender === 'male') document.getElementById('sex_m').click();
                else document.getElementById('sex_f').click();
            }, gender);

            //CHOOSE REGION
            console.log('Choosing Region');
            await iframe.evaluate(async () => {
                await new Promise(async resolve => {
                    const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) };
                    const randomInt = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min) };
                    const wait_for_loader = () => {
                        return new Promise(async res => {
                            const loader = document.querySelector('.component--preloader--youniverse_new.component--preloader');
                            while (!loader.classList.contains('ng-hide')) { await delay(20); }
                            console.log('finished waiting!!!') 
                            return res();
                        })
                    }

                    const select = document.querySelector('select[ng-model="tempData.countyId"]');
                    document.querySelector('button.btn-login[ng-click="submitRegisterStep1()"]').scrollIntoView();
                    select.options[randomInt(2, select.options.length)].selected = true;
                    select.dispatchEvent(new Event('change'));
    
                    await wait_for_loader();
                    return resolve();
                });
            });

            //CHOOSE CITY
            console.log('Choosing City');
            await iframe.evaluate(async () => {
                await new Promise(async resolve => {
                    const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) };
                    const randomInt = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min) };
                    const main_function = () => {
                        return new Promise(async res => {

                            const select = document.querySelector('select[ng-model="tempData.cityId"]');

                            while (select.querySelectorAll('option').length === 2) { await delay(300) }

                            select.options[randomInt(2, select.options.length)].selected = true;
                            select.dispatchEvent(new Event('change'));
                            return res();
                        })
                    }
                    await main_function();
                    return resolve();
                })
            });

            //CLICK ON SUBMIT
            console.log('Clicking on Submit Button');
            await iframe.click('button.btn-login[ng-click="submitRegisterStep1()"]');
            await delay(500);

            //WAIT FOR LOADER TO BE HIDDEN
            await wait_for_loader();

            //FILL PASSWORD
            await iframe.waitForSelector('#reg-pass1');
            await iframe.focus('#reg-pass1');
            await page.keyboard.type(new_user.password);

            await iframe.focus('#reg-pass2');
            await page.keyboard.type(new_user.password);

            //CHOOSE FROM SELECT
            console.log("Choosing KENT from first select");
            await iframe.select('#brand_sel', '91C7AD86-0DD7-E511-80DB-6C3BE5BEFE80');

            const choose_other_selects = async selector => {
                await new Promise(async (resolve1, reject) => {
                    try {
                        await iframe.evaluate(async (selector) => {
                            await new Promise(async resolve2 => {

                                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                const randomInt = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min) }
                                const select_option = select => {
                                    return new Promise((resolve, reject) => {
                                        try {
                                            select.options[randomInt(1, select.options.length)].selected = true;
                                            return resolve();
                                        } catch(error) { return reject(error) }
                                    })
                                }
                                const select = document.querySelector(selector);
                                
                                while (select.options.length < 2) { await delay(200) }
                                
                                let option_selected = false;
                                while (!option_selected) {
                                    try {
                                        await select_option(select);
                                        option_selected = true;
                                    } catch(e) { console.log('Error selecting option') }    
                                }
            
                                select.dispatchEvent(new Event('change'));
                                return resolve2();
                            })
                        }, selector);
                        return resolve1();
                    } catch(error) { return reject(error) }
                })
            }

            console.log("Choosing from second select");
            await iframe.waitForSelector('#variant_id');
            await choose_other_selects('#variant_id');

            console.log("Choosing from third select");
            await iframe.waitForSelector('#hnb_id');            
            await choose_other_selects('#hnb_id');

            console.log("Choosing from fourth select");
            await iframe.waitForSelector('#hbs_variant_id');
            await choose_other_selects('#hbs_variant_id');

            //WAIT FOR CODE TO ARRIVE
            let first_code = await userInput('\nWrite the code you received and press Enter:\r\n');
            first_code = first_code.replace(' ', '');

            while (first_code.length === 0) {
                first_code = await userInput('\nWrite the code you received and press Enter:\r\n');
                first_code = first_code.replace(' ', '');
            }

            await iframe.focus('#reg-code');
            await page.keyboard.type(first_code);
            console.log('Code entered correctly');
            
            //CLICK ON SUBMIT BUTTON
            await iframe.click('button.btn-login[ng-click="submitRegisterStep2()"]');
            
            //WAIT FOR LOADER TO BE HIDDEN
            await wait_for_loader();

            //ACCEPTS TERMS
            await iframe.waitForSelector('#chk_terms');
            await iframe.waitForSelector('input[ng-model="userData.CommunicationAgreement"]');
            await iframe.evaluate(() => {
                document.querySelector('#chk_terms').nextElementSibling.click();
                document.querySelector('input[ng-model="userData.CommunicationAgreement"]').nextElementSibling.click();
                document.querySelector('button.btn-login[ng-click="submitRegisterStep3()"]').scrollIntoView();
            });
            await delay(500);
            console.log('Terms accepted');

            //CLICK ON SUBMIT
            console.log('Clicking on submit button');
            await iframe.click('button.btn-login[ng-click="submitRegisterStep3()"]');

            //SECOND CODE WHICH NEEDS TO BE SAVED
            let second_code = await userInput('\nWrite the second code you received and press Enter:\r\n');
            second_code = second_code.replace(' ', '');

            while (second_code.length === 0) {
                second_code = await userInput('\nWrite the second code you received and press Enter:\r\n');
                second_code = second_code.replace(' ', '');
            }

            console.log('Entering Code')
            await iframe.focus('#input-login-code');
            await page.keyboard.type(second_code);

            console.log('Clicking on submit button');
            await iframe.click('button.btn-login[ng-click="submitRegister()"]');

            //LOGIN SUCCESSFUL
            await page.waitForNavigation({ 
                waitUntil: 'networkidle2', 
                timeout: 45000 
            });
            console.log('Login successfull. Saving user data to DB.');

            new_user.code = second_code;

            const insert_into_db = await check_number_in_database(phone_number);
            await save_created_user(new_user, insert_into_db);
            console.log('User data inserted into users table.');

            await delete_number_from_database(phone_number);
            console.log(`${phone_number} deleted from new_phones table`);

            await page.waitForSelector('app-root app-loader');
            console.log('Waiting for loader to be removed...');
            const wait_for_loader_2 = async () => {
                await new Promise(async (resolve1, reject) => {
                    try {
                        await page.evaluate(async () => {
                            await new Promise(async resolve2 => {
                                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                const wait_for_loader = () => {
                                    return new Promise(async resolve3 => {
                                        while (!!document.querySelector('app-root app-popup app-loader')) { await delay(20) }
                                        return resolve3();
                                    })
                                }
                                await wait_for_loader();
                                return resolve2();
                            })
                        });
                        console.log('Loader removed');
                        return resolve1();        
                    } catch(error) { return reject(error) }
                })
            }
            //WAIT FOR LOADER TO BE REMOVED
            await wait_for_loader_2();

            console.log('closing browser and logging in');

            await browser.close()
            return resolve(new_user);
            
        } catch(error) { console.log(error); /*return reject(error)*/ }
    })
}

const login_after_creating_account = new_user => {
    return new Promise(async (resolve, reject) => {
        try {
    
            console.log('User Data:', new_user);
    
            const browser = await puppeteer.launch(puppeteerOptions); // default is true
            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36');
    
            console.log(`Loading main site for user ${new_user.name} ${new_user.surname}`);
            await page.goto(main_url, { waitUntil: 'networkidle0', timeout: 60000 });
            
            const frameHandle = await page.waitForSelector('iframe.login__iframe');
            const iframe = await frameHandle.contentFrame();
            console.log('iframe loaded');
    
            //ACCEPT COOKIES
            await page.waitForSelector('form.form-cookie.ng-untouched div.cta > button:last-child');
            await page.click('form.form-cookie.ng-untouched div.cta > button:last-child');
            console.log('Cookies accepted');
    
            await delay(2500);
    
            const wait_for_loader = async () => {
                await new Promise(async (resolve1, reject) => {
                    try {
                        await iframe.evaluate(async () => {
                            await new Promise(async resolve2 => {
                                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                const wait_for_loader = () => {
                                    return new Promise(async resolve3 => {
                                        const loader = document.querySelector('.component--preloader--youniverse_new.component--preloader');
                                        while (!loader.classList.contains('ng-hide')) { await delay(20); }
                                        console.log('finished waiting!!!') 
                                        return resolve3();
                                    })
                                }
                                await wait_for_loader();
                                return resolve2();
                            })
                        });
                        return resolve1();
                    } catch(error) { return reject(error) }
                })
            }
    
            //WAIT FOR LOADER TO BE HIDDEN
            await iframe.waitForSelector('.component--preloader--youniverse_new.component--preloader');
            await wait_for_loader();
    
            //CLICK ON ROMANIA
            await iframe.waitForSelector(`div.form-login .ctas a.btn-login.btn-auth[ng-click="selectCountry('ro')"]`);
            await delay(500);
            await iframe.click(`div.form-login .ctas a.btn-login.btn-auth[ng-click="selectCountry('ro')"]`);
            console.log('Clicked on Romania');
    
            //WAIT FOR LOADER TO BE HIDDEN
            await wait_for_loader();
            
            //ACCEPT TERMS
            await iframe.waitForSelector(`.ng-scope .lg-wrapper.disclaimer-wrapper.ng-scope .submit-container > a.btn-login[href="#/login"]`);
            await delay(500);
            await iframe.click(`.ng-scope .lg-wrapper.disclaimer-wrapper.ng-scope .submit-container > a.btn-login[href="#/login"]`);
            console.log('Terms accepted');
    
            //WAIT FOR LOADER TO BE HIDDEN
            await wait_for_loader();
    
            //LOGIN DATA -> USER
            await iframe.waitForSelector('#input-login-telefon');
            await iframe.waitForSelector('button.btn-login[ng-click="checkPhone()"]');
            await iframe.focus('#input-login-telefon');
            await page.keyboard.type(new_user.user);
            await delay(500);
            await iframe.click('button.btn-login[ng-click="checkPhone()"]');
            console.log('User entered correctly');
    
            //WAIT FOR LOADER TO BE HIDDEN
            await delay(300);
            await wait_for_loader();
            
            //LOGIN DATA -> PASSWORD
            await iframe.focus('#input-login-password');
            await page.keyboard.type(new_user.password);
            await iframe.click('button.btn-login[ng-click="login()"]');
            await delay(500);
            console.log('Password entered correctly')

            //EVALUATE IFRAME STATUS
            const check_for_iframe = async () => {
                return await page.evaluate(async () => {
                    return await new Promise(resolve => {
                        if (!!document.querySelector('iframe')) return resolve(true);
                        return resolve(false);        
                    })
                })
            }

            //CHECKING FOR IFRAME
            let iframe_still_present = false;
            try {
                await wait_for_loader();
                console.log('checking iframe');
                iframe_still_present = await check_for_iframe();
            } catch(e) { console.log('iframe removed') }

            await delay(750);

            //ACCOUNT WASN'T CREATED CORRECTLY BECAUSE OF A BUG IN THE WEBSITE
            if (iframe_still_present) {

                iframe.click('button.btn-login[ng-click="submitRegisterStep1()"]');
                await wait_for_loader();

                console.log("Choosing KENT from first select");
                await iframe.select('#brand_sel', '91C7AD86-0DD7-E511-80DB-6C3BE5BEFE80');

                const choose_other_selects = async selector => {
                    await new Promise(async (resolve1, reject) => {
                        try {
                            await iframe.evaluate(async (selector) => {
                                await new Promise(async resolve2 => {
    
                                    const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                    const randomInt = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min) }
                                    const select_option = select => {
                                        return new Promise((resolve, reject) => {
                                            try {
                                                select.options[randomInt(1, select.options.length)].selected = true;
                                                return resolve();
                                            } catch(error) { return reject(error) }
                                        })
                                    }
                                    const select = document.querySelector(selector);
                                    
                                    while (select.options.length < 2) { await delay(200) }
                                    
                                    let option_selected = false;
                                    while (!option_selected) {
                                        try {
                                            await select_option(select);
                                            option_selected = true;
                                        } catch(e) { console.log('Error selecting option') }    
                                    }
                
                                    select.dispatchEvent(new Event('change'));
                                    return resolve2();
                                })
                            }, selector);
                            return resolve1();
                        } catch(error) { return reject(error) }
                    })
                }
    
                console.log("Choosing from second select");
                await iframe.waitForSelector('#variant_id');
                await choose_other_selects('#variant_id');
    
                console.log("Choosing from third select");
                await iframe.waitForSelector('#hnb_id');            
                await choose_other_selects('#hnb_id');
    
                console.log("Choosing from fourth select");
                await iframe.waitForSelector('#hbs_variant_id');
                await choose_other_selects('#hbs_variant_id');

                //CLICK ON SUBMIT
                await iframe.evaluate(() => {
                    document.querySelector('button.btn-login[ng-click="submitRegisterStep2()"]').scrollIntoView();
                });
                await delay(1000);
                await iframe.click('button.btn-login[ng-click="submitRegisterStep2()"]');
                await wait_for_loader();

                //ACCEPTS TERMS
                await iframe.waitForSelector('#chk_terms');
                await iframe.waitForSelector('input[ng-model="userData.CommunicationAgreement"]');
                await iframe.evaluate(() => {
                    document.querySelector('#chk_terms').nextElementSibling.click();
                    document.querySelector('input[ng-model="userData.CommunicationAgreement"]').nextElementSibling.click();
                    document.querySelector('button.btn-login[ng-click="submitRegisterStep3()"]').scrollIntoView();
                });
                console.log('Terms accepted');

                //CLICK ON SUBMIT
                await wait_for_loader();
                console.log('Clicking on submit button');
                await delay(500);
                await iframe.click('button.btn-login[ng-click="submitRegisterStep3()"]');
                
                await delay(1000);
                await wait_for_loader();

                //TYPE CODE
                await iframe.focus('#input-login-code');
                await page.keyboard.type(new_user.code);
                console.log('Code entered correctly. Clicking on submit and waiting for loader to be removed.');

                await iframe.click('button.btn-login[ng-click="submitRegister()"]');

                try { await wait_for_loader() } 
                catch(e) { console.log('iframe removed') }
            }
            
            //CLOSE PROFILE LOADER FUNCTION
            const wait_for_loader_2 = async () => {
                await new Promise(async (resolve1, reject) => {
                    try {
                        await page.evaluate(async () => {
                            await new Promise(async resolve2 => {
                                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                const wait_for_loader = () => {
                                    return new Promise(async resolve3 => {
                                        while (!!document.querySelector('app-root app-popup app-loader')) { await delay(20) }
                                        return resolve3();
                                    })
                                }
                                await wait_for_loader();
                                return resolve2();
                            })
                        });
                        console.log('Loader removed');
                        return resolve1();        
                    } catch(error) { return reject(error) }
                })
            }

            //LOGIN SUCCESSFUL
            console.log('Login successful');
            await page.waitForSelector('app-root app-loader');

            //WAIT FOR LOADER TO BE REMOVED
            console.log('Waiting for loader to be removed');
            await wait_for_loader_2();
            await delay(300);
            await wait_for_loader_2();

            //CLOSE POLICY UPDATE
            await page.evaluate(async () => {
                await new Promise(async resolve1 => {
                    const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }        
                    const remove_div = () => {
                        return new Promise(async resolve2 => {
                            if (!!document.querySelector('app-policy-update-bar .component--policy-update')) {
                                document.querySelector('app-policy-update-bar .component--policy-update .btn-close-banner').click();
                                await delay(50);
                                while (!!document.querySelector('app-root app-popup app-loader')) { console.log('waiting for div to close'); await delay(20) }
                            }
                            return resolve2();
                        })
                    }
                    await remove_div();
                    return resolve1();
                })
            });
            console.log('Policy Update closed');

            //CLOSE WELCOME DIV
            await page.waitForSelector('app-popup app-walkthrough .popup-close');
            await page.click('app-popup app-walkthrough .popup-close');
            console.log('welcome div closed');
            await delay(1000);

            //WAIT FOR LOADER TO BE REMOVED
            await wait_for_loader_2();

            //CLICK ON PROFILE
            console.log('Opening profile');
            await page.waitForSelector('.header-element.code-profile > .profile');
            await delay(500);
            await page.click('.header-element.code-profile > .profile');

            //WAIT FOR LOADER TO BE REMOVED
            await wait_for_loader_2();

            //CLICK ON MY STUFF
            await page.waitForSelector('app-profile .popup-profile .mystuff');
            await delay(500);
            await page.click('app-profile .popup-profile .mystuff');
            console.log('Clicked on my stuff');

            //WAIT FOR LOADER TO BE REMOVED
            await wait_for_loader_2();

            console.log('Getting coin value...');
            await page.waitForSelector('youcoinstats .card-wrapper .card.earned span');
            const coins = await (async () => {
                return await page.evaluate(async () => {
                    return await new Promise(resolve => {
                        (async () => {
                            const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                            const get_value = () => { return document.querySelector('youcoinstats .card-wrapper .card.earned span').innerText }
                            while (get_value() === '-') { await delay(20) }
                            return resolve(get_value());
                        })();
                    })
                })
            })();

            console.log(`Coin value is: ${coins}`);
            await update_user_coins(new_user.user, coins);
            console.log('Coin value saved to DB');

            console.log(`Finished creating account for user ${new_user.name} ${new_user.surname}\r\n`);
            await browser.close();
            return resolve();

        } catch(error) { return reject(error) }
    })
}

/*************************************** GET COINS FOR EACH USER FUNCTIONS *************************************/
const get_limited_users_from_database = user_amount => {
    return new Promise((resolve, reject) => {
        conn.query(`
        SELECT * FROM users WHERE updated=0 ORDER BY id LIMIT ${user_amount};
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve(results);
        })
    })
}

const get_unapdated_users_from_database = () => {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT * FROM users WHERE updated=0 ORDER BY id;
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve(results);
        })
    })
}

const get_all_users_from_database = () => {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT * FROM users ORDER BY id;
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve(results);
        })
    })  
}

const changeUsersStatus = () => {
    return new Promise((resolve, reject) => {
        conn.query(`
            UPDATE users SET updated=0;
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve(results);
        })
    }) 
}

const login_users = users => {
    return new Promise(async (resolve, reject) => {
        try {

            for (let i = 0; i < users.length; i++) {

                const browser = await puppeteer.launch(puppeteerOptions); // default is true
                const page = await browser.newPage();
                page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36');

                const user = {
                    id: users[i].id,
                    name: users[i].name,
                    surname: users[i].surname,
                    user: users[i].user,
                    password: users[i].password
                }

                console.log(`Loading main site for user: `, user);
                await page.goto(main_url, { waitUntil: 'networkidle0', timeout: 60000 });
                
                const frameHandle = await page.waitForSelector('iframe.login__iframe');
                const iframe = await frameHandle.contentFrame();
                console.log('iframe loaded');
    
                //ACCEPT COOKIES
                await page.waitForSelector('form.form-cookie.ng-untouched div.cta > button:last-child');
                await page.click('form.form-cookie.ng-untouched div.cta > button:last-child');
                console.log('Cookies accepted');
    
               await delay(2500);

               const wait_for_loader = async () => {
                await new Promise(async (resolve1, reject) => {
                    try {
                        await iframe.evaluate(async () => {
                            await new Promise(async resolve2 => {
                                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                const wait_for_loader = () => {
                                    return new Promise(async resolve3 => {
                                        const loader = document.querySelector('.component--preloader--youniverse_new.component--preloader');
                                        while (!loader.classList.contains('ng-hide')) { await delay(20); }
                                        console.log('finished waiting!!!') 
                                        return resolve3();
                                    })
                                }
                                await wait_for_loader();
                                return resolve2();
                            })
                        });
                        return resolve1();
                    } catch(error) { return reject(error) }
                })
            }

                //WAIT FOR LOADER TO BE HIDDEN
                await iframe.waitForSelector('.component--preloader--youniverse_new.component--preloader');
                await wait_for_loader();
    
                //CLICK ON ROMANIA
                await iframe.waitForSelector(`div.form-login .ctas a.btn-login.btn-auth[ng-click="selectCountry('ro')"]`);
                await delay(500);
                await iframe.click(`div.form-login .ctas a.btn-login.btn-auth[ng-click="selectCountry('ro')"]`);
                console.log('Clicked on Romania');

                //WAIT FOR LOADER TO BE HIDDEN
                await wait_for_loader();
                
                //ACCEPT TERMS
                await iframe.waitForSelector(`.ng-scope .lg-wrapper.disclaimer-wrapper.ng-scope .submit-container > a.btn-login[href="#/login"]`);
                await delay(500);
                await iframe.click(`.ng-scope .lg-wrapper.disclaimer-wrapper.ng-scope .submit-container > a.btn-login[href="#/login"]`);
                console.log('Terms accepted');
    
                //WAIT FOR LOADER TO BE HIDDEN
                await wait_for_loader();

                //LOGIN DATA -> USER
                await iframe.waitForSelector('#input-login-telefon');
                await iframe.waitForSelector('button.btn-login[ng-click="checkPhone()"]');
                await iframe.focus('#input-login-telefon');
                await page.keyboard.type(user.user);
                await delay(500);
                await iframe.click('button.btn-login[ng-click="checkPhone()"]');
                console.log('User entered correctly');
    
                //LOGIN DATA -> PASSWORD
                await iframe.waitForSelector('#input-login-password');
                await iframe.waitForSelector('button.btn-login[ng-click="login()"]');
                await iframe.focus('#input-login-password');
                await page.keyboard.type(user.password);

                //WAIT FOR LOADER TO BE HIDDEN
                await wait_for_loader();
                await delay(1000);
                await iframe.click('button.btn-login[ng-click="login()"]');
                console.log('Password entered correctly');
    
                //LOGIN SUCCESSFUL
                await page.waitForNavigation({ 
                    waitUntil: 'networkidle2', 
                    timeout: 45000 
                });
                console.log('Login successful...');
    
                await page.waitForSelector('app-root app-loader');
                console.log('Waiting for loader to be removed...');
     
                const wait_for_loader_2 = async () => {
                    await new Promise(async (resolve1, reject) => {
                        try {
                            await page.evaluate(async () => {
                                await new Promise(async resolve2 => {
                                    const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                    const wait_for_loader = () => {
                                        return new Promise(async resolve3 => {
                                            while (!!document.querySelector('app-root app-popup app-loader')) { await delay(20) }
                                            return resolve3();
                                        })
                                    }
                                    await wait_for_loader();
                                    return resolve2();
                                })
                            });
                            console.log('Loader removed');
                            return resolve1();        
                        } catch(error) { return reject(error) }
                    })
                }
                //WAIT FOR LOADER TO BE REMOVED
                await wait_for_loader_2();

                //REMOVE FIRST TIME LOGIN DIV
                await page.evaluate(async () => {
                    await new Promise(async resolve => {
                        const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }        
                        const remove_div = () => {
                            return new Promise(async res => {
                                if (!!document.querySelector('app-policy-update-bar .component--policy-update')) {
                                    document.querySelector('app-policy-update-bar .component--policy-update .btn-close-banner').click();
                                    await delay(50);
                                    while (!!document.querySelector('app-root app-popup app-loader')) { console.log('waiting for div to close'); await delay(20) }
                                }
                                return res();
                            })
                        }
                        await remove_div();
                        return resolve();
                    })
                });
    
                //CLICK ON PROFILE
                await page.waitForSelector('.header-element.code-profile > .profile');
                await delay(500);
                await page.click('.header-element.code-profile > .profile');
                console.log('Opening profile');
    
                //WAIT FOR LOADER TO BE REMOVED
                await wait_for_loader_2();
    
                //CLICK ON MY STUFF
                await page.waitForSelector('app-profile .popup-profile .mystuff');
                await delay(500);
                await page.click('app-profile .popup-profile .mystuff');
                console.log('Clicked on my stuff');
    
                //WAIT FOR LOADER TO BE REMOVED
                await wait_for_loader_2();
    
                console.log('Getting coin value...');
                await page.waitForSelector('youcoinstats .card-wrapper .card.earned span');
                const coins = await (async () => {
                    return await page.evaluate(async () => {
                        return await new Promise(resolve => {
                            (async () => {
                                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                                const get_value = () => { return document.querySelector('youcoinstats .card-wrapper .card.earned span').innerText }
                                while (get_value() === '-') { await delay(20) }
                                return resolve(get_value());
                            })();
                        })
                    })
                })();
    
                console.log(`Coin value is: ${coins}`);

                await update_user_coins(user.id, coins);

                console.log(`Finished getting coins for user ${user.name}\r\n`);
                await browser.close();
            }

            console.log('Finished all users succesfully.');
            return resolve();
        } catch(error) { return reject(error) }
    })
}

/*************************************** INTERACTIVE MENU FUNCTIONS *************************************/

//MENU -> OPTION 1 -> UPDATE COINS MENU
const menucreate_account = () => {
    return new Promise(async (resolve, reject) => {
        try {
            console.clear();
            console.log('Getting number from database');
            const phone_numbers = await get_new_numbers();

            while (true) {

                console.log('The following numbers are about to be created:\r\n', phone_numbers, '\r\n');

                let continue_ = await userInput(`¿ Continue (y = yes / n = Back to Main Menu) ?\r\n`)
                continue_ = continue_.toLowerCase().substring(0, 1);
    
                if (continue_ === 'y') {
                    for (let i = 0; i < phone_numbers.length; i++) {
                        const new_user = await create_account(phone_numbers[i].number);
                        await login_after_creating_account(new_user);
                    }
                    console.log('Finished all users succesfully');    
                }
    
                else if (continue_ === 'n') {
                    console.clear();
                    return resolve();
                }
                else {
                    console.clear();
                    console.log('Invalid option. Try Again.\r\n');
                }
            }
        }
        catch(error) { return reject(error) }
    })
}

//MENU -> OPTION 2 -> UPDATE COINS MENU
const menuUpdateCoins = () => {
    return new Promise(async (resolve, reject) => {
        console.clear();
        try {
            while (true) {
                
                console.log('Update existing accounts -> Choose your option and press Enter.\r\n');
                
                let option = await userInput(`Option 1: Update a limited amount of users that haven't been updated.\r\nOption 2: Update all users that haven't been updated yet.\r\nOption 3: Update ALL USERS.\r\nOption 4: Set all users in database to Not Updated Status.\r\nOption 5: Back to main menu.\r\nOption 6: Exit Script.\r\n\r\n`);
                option = parseInt(option.replace(/\D/gm, ''));
    
                if (option === 1) await menuUpdateCoins_option1();
    
                else if (option === 2) await menuUpdateCoins_option2();
    
                else if (option === 3) await menuUpdateCoins_option3();
    
                else if (option === 4) await menuUpdateCoins_option4();
                
                //BACK TO MAIN MENU
                else if (option === 5) {
                    console.clear();
                    break;
                }
    
                else if (option === 6) await exit_script();
    
                else console.log('\r\n\r\nInvalid Option. Try Again.');

            }
            return resolve();
        }
        catch(error) { console.log(`Something went wrong updating coins. ${error}`); return reject(error) }
    })
}

//MENU -> OPTION 2 -> UPDATE A LIMITED AMOUNT OF USERS
const menuUpdateCoins_option1 = () => {
    return new Promise(async (resolve, reject) => {
        try {

            console.clear();
            console.log(`Update existing accounts -> Update a limited amount of users`);
            
            let users_amount = await userInput('Enter the amount of users you would like to update:\r\n');
            users_amount = users_amount.replace(/\D/gm, '');

            console.log(`\r\nUpdating ${users_amount} users.`);

            const users = await get_limited_users_from_database(users_amount);
            await login_users(users);
            
            console.log('Users coins updated correctly.');
            exit_script();

            return resolve()    
        } catch(e) { return reject(e) }
    })
}

////MENU -> OPTION 2 -> UPDATE ALL USERS THAT HAVEN'T BEEN UPDATED YET
const menuUpdateCoins_option2 = () => {
    return new Promise(async (resolve, reject) => {
        try {

            console.clear();
            console.log(`Updating all users that haven't been updated yet.`);

            const users = await get_unapdated_users_from_database();
            await login_users(users);

            console.log('Users coins updated correctly.');
            exit_script();

            return resolve();
        } catch(e) { return reject(e) }
    })
}

//MENU -> OPTION 2 -> UPDATE ALL USERS WETHER THEY HAVE BEEN UPDATED OR NOT
const menuUpdateCoins_option3 = () => {
    return new Promise(async (resolve, reject) => {
        try {

            console.clear();
            console.log(`Updating ALL USERS.`);

            const users = await get_all_users_from_database();
            await login_users(users);

            console.log('Users coins updated correctly.');
            exit_script();

            return resolve();
        } catch(e) { return reject(e) }
    })
}

//MENU -> OPTION 2 -> SET ALL USERS TO NOT UPDATED STATUS
const menuUpdateCoins_option4 = () => {
    return new Promise(async (resolve, reject) => {
        try {

            console.clear();

            await changeUsersStatus();
            console.log('All users have been set to Not Updated Status.\r\n');

            return resolve();
        } catch(e) { return reject(e) }
    })
}

/*************************************** INTERACTIVE MENU FUNCTIONS *************************************/
const get_accounts_creation_date = () => {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT id, user, created, coins FROM users WHERE status=1;
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve(results);
        })
    })
}

const check_account_to_deactivate = id => {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT coins, created FROM users WHERE id=${parseInt(id)};
        `, (error, results, fields) => {
            if (error || results.length === 0) return reject(error);
            const coins = results[0].coins;
            const created = results[0].created;
            const now = todays_date();
            if ((now - created) / (1000 * 3600 * 24) < 7 && coins === 0) return resolve(true);
            return resolve(false);
        })
    })
}

const deactivate_expired_account = id => {
    return new Promise((resolve, reject) => {
        conn.query(`
            UPDATE users SET status=0 WHERE id=${parseInt(id)};
        `, (error, results, fields) => {
            if (error) return reject(error);
            return resolve();
        })
    })
}

const deactivate_accounts = () => {
    return new Promise(async (resolve, reject) => {
        try {

            const active_accounts = await get_accounts_creation_date();
            const expired_accounts = [];
            
            for (let i = 0; i < active_accounts.length; i++) {
                
                const now = new Date(todays_date());
                const created = active_accounts[i].created;
                if (created === null) continue;

                const days_since_created = (now - created) / (1000 * 3600 * 24);

                if (days_since_created < 7 && active_accounts[i].coins === 0) {
                    expired_accounts.push({
                        id: active_accounts[i].id,
                        number: active_accounts[i].user,
                        days_since_created
                    });
                }
            }

            while (true) {

                console.clear();
                console.log(`Deactivate expired accounts.\r\n\The following accounts have 0 coins and were created less than a week ago:`, expired_accounts, '\r\n\r\nChoose your option and press Enter');
                
                let option = await userInput('Option 1: Deactivate all expired accounts.\r\nOption 2: Deactivate selected numbers by id.\r\n');
                option = parseInt(option.replace(/\D/gm, ''));

                if (option === 1) {
                    for (let i = 0; i < expired_accounts.length; i++) {
                        await deactivate_expired_account(expired_accounts[i].id);
                    }
                    console.clear();
                    console.log('Expired accounts were deactivated.');
                    break;
                }

                else if (option === 2) {
                    
                    console.clear();
                    console.log('Deactivate expired accounts -> Deactivate selected numbers by id');
                    console.log(expired_accounts);

                    let ids = await userInput('Write the id of each account you whish to deactivate separated by a comma (eg: 1,2,3,4,5):\r\n');
                    ids = ids.split(',');
                    console.log('\r\n');

                    for (let i = 0; i < ids.length; i++) {
                        if (parseInt(ids[i]) !== NaN) {
                            const allowed = await check_account_to_deactivate(ids[i]);
                            if (allowed) await deactivate_expired_account(ids[i]);
                            else console.log(`id ${ids[i]} couldn't be deactivated because it was createad more than 7 days ago.`)
                        }
                    }

                    console.log('\r\nFinished deactivating selected ids.\r\n\r\n');
                    break;
                }

                else console.log('\r\nInvalid option. Try again.\r\n')
            }

            return resolve();
        } catch(error) { return reject(error) }
    })
}

const exit_script = () => { 
    console.log(`Exiting Script. Good Bye.`);
    process.exit();
}

(async () => {

    console.clear();
    console.log('\r\nHello! What would you like to do today ?\r\n');

    while (true) {

        console.log('Write the number of your option and press Enter:');
        let action = await userInput('Option 1: Create accounts.\r\nOption 2: Update existing accounts.\r\nOption 3: Deactivate expired accounts\r\nOption 4: Exit Script.\r\n\r\n');
        action = parseInt(action.replace(/\D/gm, ''));
    
        if (action === 1) await menucreate_account();

        else if (action === 2) await menuUpdateCoins();

        else if (action === 3) await deactivate_accounts();

        else if (action === 4) exit_script();

        else {
            console.clear();
            console.log('Invalid option. Write the number of your option and press Enter.');
        }
    }
})();
