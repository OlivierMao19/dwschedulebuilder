from bs4 import BeautifulSoup
import requests
from cs50 import SQL


# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///schedule.db")
#ADD profiles you want to insert
profiles = []
# specific_ed of Sciences and social sciences: ['200B0-101', '200B0-202', '200B0-420', '200B0-205', '200B0-201', '200B0-203', '300A0-ALL']
# discipline for general courses: 603 english, 602 french, 345 humanities, complementary to be added

#Get connection via cookies: https://curlconverter.com/ curl as bash
for profile in profiles:
    cookies = {
        'wordpress_sec_64850283c7b20f24c222d31d9820bac3': '2333073%7C1735785601%7CQfQV3Na3gfqQaKQ1vQrHxpoTCcTZMxbdmMLVQ4yUuK0%7C4a7d4d2b46b0cd29b2493f9c13571879e83b4f47f07098096a04f512bd68e05d',
        '_ga': 'GA1.3.1580403855.1732156948',
        'wordpress_test_cookie': 'WP%20Cookie%20check',
        'wordpress_sec_64850283c7b20f24c222d31d9820bac3': '2333073%7C1735785601%7CQfQV3Na3gfqQaKQ1vQrHxpoTCcTZMxbdmMLVQ4yUuK0%7C4a7d4d2b46b0cd29b2493f9c13571879e83b4f47f07098096a04f512bd68e05d',
        'wordpress_logged_in_64850283c7b20f24c222d31d9820bac3': '2333073%7C1735785601%7CQfQV3Na3gfqQaKQ1vQrHxpoTCcTZMxbdmMLVQ4yUuK0%7C476aeadef466f934d8669ec5f73163b335b3389416e67d96a406c13e70673ccc',
        'dawson_tta': '{}',
    }

    headers = {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        # 'Cookie': 'wordpress_sec_64850283c7b20f24c222d31d9820bac3=2333073%7C1735785601%7CQfQV3Na3gfqQaKQ1vQrHxpoTCcTZMxbdmMLVQ4yUuK0%7C4a7d4d2b46b0cd29b2493f9c13571879e83b4f47f07098096a04f512bd68e05d; _ga=GA1.3.1580403855.1732156948; wordpress_test_cookie=WP%20Cookie%20check; wordpress_sec_64850283c7b20f24c222d31d9820bac3=2333073%7C1735785601%7CQfQV3Na3gfqQaKQ1vQrHxpoTCcTZMxbdmMLVQ4yUuK0%7C4a7d4d2b46b0cd29b2493f9c13571879e83b4f47f07098096a04f512bd68e05d; wordpress_logged_in_64850283c7b20f24c222d31d9820bac3=2333073%7C1735785601%7CQfQV3Na3gfqQaKQ1vQrHxpoTCcTZMxbdmMLVQ4yUuK0%7C476aeadef466f934d8669ec5f73163b335b3389416e67d96a406c13e70673ccc; dawson_tta={}',
        'Origin': 'https://timetable.dawsoncollege.qc.ca',
        'Referer': 'https://timetable.dawsoncollege.qc.ca/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'X-Requested-With': 'XMLHttpRequest',
    }

    #Add profile variable to the element that is posted
    search_data = {
        'action': 'timetable_search',
        'nonce': 'e76646f530',
        'specific_ed': '',
        'discipline': profile,
        'general_ed': '',
        'special_ed': '',
        'certificates': '',
        'learning_comm': '',
        'course_title': '',
        'section': '',
        'teacher': '',
        'intensive': '',
        'seats': ''
    }

    #Get response
    response = requests.post('https://timetable.dawsoncollege.qc.ca/wp-content/plugins/timetable/search.php', cookies=cookies, headers=headers, data=search_data)
    #BeautifulSoup format
    soup = BeautifulSoup(response.content, 'html.parser')

    #Create list with course code
    classes = [tag.string for tag in soup.find_all(class_="cnumber")]
    print(classes)

    #Add values to courses table
    for course in classes:
        try:
            db.execute("INSERT INTO courses (course_code) VALUES (:course)", course = course)
        except ValueError:
            print("dup"+course)

