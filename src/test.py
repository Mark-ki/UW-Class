import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re
import unicodedata
import re

class Subject:
    def __init__(self, name, prereqs, prereqsText):
        self.name = name
        self.prereqs = prereqs
        self.prereqsText = unicodedata.normalize('NFKD', prereqsText).replace('\u200b', '')
        self.findConditions()

    def __str__(self):
        prereqs_str = ', '.join(self.prereqs)
        return self.name + ": " + prereqs_str
    
    def findConditions(self):
        # and/or
        # concurrent enrollment
        # (,)
        # others:
        # Junior standing
        # Graduate/professional standing
        # Not open to...
        # declared in...
        # consent of instructor
        # None
        # MSB etc.
        
        sentence = self.prereqsText

        # Define patterns for different types of prerequisites
        standing_pattern = re.compile(r'\b(?:Junior|Graduate/professional)\sstanding\b')
        not_open_pattern = re.compile(r'\bNot\sopen\sto\b.*?:')
        declared_pattern = re.compile(r'\bdeclared\sin\b.*?program\b')

        
        # Extract and remove the specific phrase from the sentence
        # Remove the phrase "or concurrent enrollment" from the sentence
        sentence = re.sub(r'\bor concurrent enrollment\b', '', sentence, flags=re.IGNORECASE)
        specialNotes = None
        declared_phrase_pattern = re.compile(r'(?:and graduate/professional standing|graduate/professional standing|declared in|or declared in|Not open to)\b.*?(?=\)|,|$)')
        declared_phrase_match = declared_phrase_pattern.search(sentence)
        if declared_phrase_match:
            specialNotes = declared_phrase_match.group().strip()
        sentence = declared_phrase_pattern.sub('', sentence)

        # Split by "or" when not part of parentheses
        split_by_or = re.split(r'\bor\b(?![^()]*\))(?!\s+[A-Z]+\s+\d+)', sentence)
        split_by_or = [part.split('.') for part in split_by_or]
        split_by_period = [part for sublist in split_by_or for part in sublist]


        # Give each class code a department
        updatedCode = ""

        department_code_pattern = re.compile(r'(?!,|\s*and\s*|\s*or\s*|\s|nd\s|d\s|r\s)[\bA-Za-z\s\/\b]++(?=\d+)')
        departmentCode = department_code_pattern.findall(sentence)
        departmentCode = list(set(code.strip() for code in departmentCode))

        class_code_pattern = re.compile(r'(?:, |or )(\d+)')
        # classCode = class_code_pattern.findall(sentence)
        
        
        for i in range(len(departmentCode)):
            curr = ""
            if(i+1 < len(departmentCode)):
                curr = sentence[sentence.find(departmentCode[i]):sentence.find(departmentCode[i+1])]
            else:
                curr = sentence[sentence.find(departmentCode[i]):]

            # curr.replace(departmentCode[i], "")
            classCode = class_code_pattern.findall(curr)
            for j in classCode:
                if(j.isdigit()):
                    curr = curr.replace(j, departmentCode[i] + " " + j)
                    # print(curr)

            curr = curr.replace('(', '').replace(')', '')
            updatedCode += curr

        # Clean up trailing spaces, commas, semicolons, or full stops in updatedCode
        updatedCode = re.sub(r'[;,\.]\s*$', '', updatedCode).strip()

        split_by_and = re.split(r'\band\b(?![^()]*\))(?!\s+[A-Z]+\s+\d+)', updatedCode)
        print("Split by and: ", split_by_and)

    
        # Store the results in the Subject's attributes
        self.prereqs = split_by_period

        with open("output.txt", "a", encoding="utf-8") as file:
            file.write("\nCourse Name: " + self.name + "\n")
            file.write("Class Requisites: " + str(self.prereqs) + "\n")
            # file.write("Other Requisites: " + str(other_requisites) + "\n")
            file.write("Prereqs Text: " + self.prereqsText + "\n")
            file.write("Department Codes: " + str(departmentCode) + "\n")
            # file.write("Class Codes: " + str(classCode) + "\n")
            file.write("Notes: " + str(specialNotes) + "\n")
            file.write("Class Codes: " + updatedCode + "\n")


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
for i in range(1):
    # WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'atozindex')))
    driver.get(website)

    lists = driver.find_element(By.ID, 'atozindex').find_elements(By.TAG_NAME, 'ul') 
    itemList = [item for sublist in lists for item in sublist.find_elements(By.TAG_NAME, 'li')]

    item = itemList[counter]
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'a')))
    # print(item.find_elements(By.TAG_NAME, "a")[0].get_attribute("href"))
    driver.get(item.find_elements(By.TAG_NAME, "a")[0].get_attribute("href"))

    courseblocks = driver.find_element(By.CLASS_NAME, 'sc_sccoursedescs').find_elements(By.CLASS_NAME, 'courseblock')

    
    for courseblock in courseblocks:
        course_name = courseblock.find_element(By.TAG_NAME, 'span').text
        # name_ab = courseblock.find_element(By.CLASS_NAME, 'cbextra-data').find_elements(By.TAG_NAME, 'a').get_attribute("title")
        prereqs = courseblock.find_element(By.CLASS_NAME, 'cbextra-data').find_elements(By.TAG_NAME, 'a')
        prereqsText = courseblock.find_element(By.CLASS_NAME, 'cbextra-data').get_attribute("textContent")
        prereqs = [prereq.get_attribute("title") for prereq in prereqs]
        subject = Subject(course_name, prereqs, prereqsText)
        # print(subject)
        # print(prereqsText)
        courses.append(subject)


    counter += 1

# for course in courses: print(course)

driver.quit()





