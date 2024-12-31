from bs4 import BeautifulSoup, element
import requests
from cs50 import SQL
from timeChanger import timeChange

#Function to find the label section
def contains_section(tag):
    return tag.name == 'label' and 'Section' == tag.get_text()

def contains_section_title(tag):
    return tag.name == 'label' and 'Section Title' == tag.get_text()

#Function to find the label teacher
def contains_teacher(tag):
    return tag.name == 'label' and 'Teacher' in tag.get_text()

#Function to find the label comment
def contains_comment(tag):
    return tag.name == 'label' and 'Comment' in tag.get_text()


# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///schedule.db")

#Initialize lists of id and courses
courses_list = db.execute("SELECT id, course_code FROM courses")
id = [row['id'] for row in courses_list]
courses = [row['course_code'] for row in courses_list]

#Loop for every course in database
for i in range(len(courses)):

    #get course_id value and course_title
    course_id = id[i]
    course_code = courses[i]

    #Get connection via cookies
    cookies = {
        'wordpress_sec_64850283c7b20f24c222d31d9820bac3': '2333073%7C1721677028%7CduKUM9BRY1fP5t5J6Gu8rmKTDrr1cobvoKy0vFAdzHg%7C1aaafba5b35a02e3cf21c0b02c480fe9df62e3429b589e381bb711c5aaa46259',
        '_ga_9CR35XX79D': 'GS1.3.1721185409.3.1.1721185539.0.0.0',
        '_ga': 'GA1.1.1629041828.1721004872',
        '_ga_RYQY8EEFVG': 'GS1.1.1721185660.4.1.1721187805.60.0.0',
        '_ga_5RDDCMFRZC': 'GS1.1.1721346041.6.0.1721346043.0.0.0',
        '_ga_Z66L6Q4BDL': 'GS1.1.1721346041.6.0.1721346043.0.0.0',
        'wordpress_test_cookie': 'WP%20Cookie%20check',
        'wordpress_sec_64850283c7b20f24c222d31d9820bac3': '2333073%7C1721677028%7CduKUM9BRY1fP5t5J6Gu8rmKTDrr1cobvoKy0vFAdzHg%7C1aaafba5b35a02e3cf21c0b02c480fe9df62e3429b589e381bb711c5aaa46259',
        'wordpress_logged_in_64850283c7b20f24c222d31d9820bac3': '2333073%7C1721677028%7CduKUM9BRY1fP5t5J6Gu8rmKTDrr1cobvoKy0vFAdzHg%7C838a8b9a9b648ca2ab7370963d13948a10831cdbc894d7ab05dd9d1d7d7565d5',
        'dawson_tta': '{}',
    }

    headers = {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        # 'Cookie': 'wordpress_sec_64850283c7b20f24c222d31d9820bac3=2333073%7C1721677028%7CduKUM9BRY1fP5t5J6Gu8rmKTDrr1cobvoKy0vFAdzHg%7C1aaafba5b35a02e3cf21c0b02c480fe9df62e3429b589e381bb711c5aaa46259; _ga_9CR35XX79D=GS1.3.1721185409.3.1.1721185539.0.0.0; _ga=GA1.1.1629041828.1721004872; _ga_RYQY8EEFVG=GS1.1.1721185660.4.1.1721187805.60.0.0; _ga_5RDDCMFRZC=GS1.1.1721346041.6.0.1721346043.0.0.0; _ga_Z66L6Q4BDL=GS1.1.1721346041.6.0.1721346043.0.0.0; wordpress_test_cookie=WP%20Cookie%20check; wordpress_sec_64850283c7b20f24c222d31d9820bac3=2333073%7C1721677028%7CduKUM9BRY1fP5t5J6Gu8rmKTDrr1cobvoKy0vFAdzHg%7C1aaafba5b35a02e3cf21c0b02c480fe9df62e3429b589e381bb711c5aaa46259; wordpress_logged_in_64850283c7b20f24c222d31d9820bac3=2333073%7C1721677028%7CduKUM9BRY1fP5t5J6Gu8rmKTDrr1cobvoKy0vFAdzHg%7C838a8b9a9b648ca2ab7370963d13948a10831cdbc894d7ab05dd9d1d7d7565d5; dawson_tta={}',
        'Origin': 'https://timetable.dawsoncollege.qc.ca',
        'Referer': 'https://timetable.dawsoncollege.qc.ca/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
    }

    #Add profile variable to the element that is posted
    search_data = {
        'action': 'timetable_search',
        'nonce': '9e10fd10ca',
        'specific_ed': '',
        'discipline': '',
        'general_ed': '',
        'special_ed': '',
        'certificates': '',
        'learning_comm': '',
        'course_title': course_code,
        'section': '',
        'teacher': '',
        'intensive': '',
        'seats': ''
    }

    #Get response
    response = requests.post('https://timetable.dawsoncollege.qc.ca/wp-content/plugins/timetable/search.php', cookies=cookies, headers=headers, data=search_data)

    #BeautifulSoup format
    soup = BeautifulSoup(response.content, 'html.parser')

    #Find course title
    course_title = soup.find('div', class_='ctitle').get_text()
    course_full_title = course_title

    #Find all of the sections and its information for ith course
    if soup.find_all('ul') is None:
        continue
    for ul in soup.find_all('ul', class_="section-details"):
        #Find section title
        section_title = ul.find(contains_section_title)
        if section_title is not None:
            section_title = section_title.find_next('div').get_text()
            course_full_title = course_title + ' - ' + section_title

        #Find section number
        sections = ul.find(contains_section)
        if sections is not None:
            section = sections.find_next('div').get_text()

        #Find teacher's name
        teachers = ul.find(contains_teacher)
        if teachers is not None:
            teacher = teachers.find_next('div').get_text()

        #Find comment if there is, else return empty string
        comments = ul.find(contains_comment)
        if comments is not None:
            comment_div = comments.find_next('div')
            comment = ''.join(' ' if isinstance(item, element.Tag) and item.name == 'br' else str(item) for item in comment_div.contents)
        else:
            comment = ''

        #Insert into sections table
        db.execute("INSERT INTO sections (course_id, course_full_title, section, teacher, comment) VALUES (:course_id, :course_full_title, :section, :teacher, :comment)", course_id=course_id, course_full_title=course_full_title, section=section, teacher=teacher, comment=comment)

        #Get section_id for foreign key in timetable
        section_id = db.execute("SELECT last_insert_rowid()")[0]["last_insert_rowid()"]

        #Find schedule of section and add to times dict
        times = {'section_id':section_id}
        tables = ul.find('table')

        #To break if time format is not good
        skip_row = False
        for row in tables.find_all('tr'):
            day_key = row.contents[0].get_text()
            try:
                time_value = timeChange(row.contents[1].get_text())
            except ValueError:
                skip_row = True
                break

            times[day_key] = time_value

        if skip_row:
            continue

        #Create string format for query to add in timetable
        keys = ', '.join(times.keys())
        placeholders = ', '.join(':' + key for key in times.keys())

        query = f'INSERT INTO timetable ({keys}) VALUES ({placeholders})'
        db.execute(query, **times)

        #print(section, teacher, comment) TEST
print("success")
