import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class Subject:
    def __init__(self, name, prereqs):
        self.name = name
        self.prereqs = prereqs

    def __str__(self):
        return self.name + ": " + self.prereqs

website = 'https://guide.wisc.edu/courses'
path = 'C:/Users/gimin/Documents/ClassTreeProject/chromedriver-win64/chromedriver.exe'
cService = webdriver.ChromeService(executable_path=path)
driver = webdriver.Chrome(service=cService)

driver.get(website)
lists = driver.find_element(By.ID, 'atozindex').find_elements(By.TAG_NAME, 'ul') 
itemList = [item for sublist in lists for item in sublist.find_elements(By.TAG_NAME, 'li')]

counter = 0
courses = []

# for i in range(len(itemList)):
for i in range(2):
    # WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'atozindex')))
    driver.get(website)

    lists = driver.find_element(By.ID, 'atozindex').find_elements(By.TAG_NAME, 'ul') 
    itemList = [item for sublist in lists for item in sublist.find_elements(By.TAG_NAME, 'li')]

    item = itemList[counter]
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'a')))
    print(item.find_elements(By.TAG_NAME, "a")[0].get_attribute("href"))
    driver.get(item.find_elements(By.TAG_NAME, "a")[0].get_attribute("href"))

    courseblocks = driver.find_element(By.CLASS_NAME, 'sc_sccoursedescs').find_elements(By.CLASS_NAME, 'courseblock')

    
    for courseblock in courseblocks:
        print("next")
        course_name = courseblock.find_element(By.TAG_NAME, 'span').text
        # prereqs = courseblock.find_element(By.CLASS_NAME, 'cbextra-data').find_element(By.TAG_NAME, 'a').get_attribute('href')
        prereqs = courseblock.find_element(By.CLASS_NAME, 'cbextra-data').get_attribute("textContent")
        subject = Subject(course_name, prereqs)
        # print(subject)
        courses.append(subject)

    counter += 1

for course in courses: print(course)

driver.quit()



