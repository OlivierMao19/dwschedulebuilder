//Declare input and searchButton
let input = document.querySelector('#course-input');
let searchButton = document.querySelector('#search-button');

// Get real time values of courses number with AJAX
input.addEventListener('input', async function() {
  let response = await fetch('/search?q=' + input.value);
  let courses = await response.json();
  let html = '';
  const existingCourses = courseListComponent.state.courses.map(course => course.course_code);

  for (let course in courses) {
    let course_code = courses[course].course_code;
    let disabled = existingCourses.includes(course_code) ? 'style="display: none;" disabled' : '';
    html += '<button type="button" class="list-group-item list-group-item-dark search-class" data-id="' + courses[course].id + '" ' + disabled + '>' + course_code + '</button>';
  }
  document.querySelector('#course-container').innerHTML = html;
  let buttons = document.querySelectorAll('.search-class');
  let matchFound = Array.from(buttons).some(button => button.textContent.trim() === input.value.trim().toUpperCase() && !button.disabled);
  if (input.value !== '') {
    searchButton.disabled = !matchFound;
  }
  else {
    searchButton.disabled = true;
  }
});

// Get JSON values when we submit FORM with valid course_code
let form = document.querySelector('#class-search');

form.addEventListener('submit', async function(event) {
  event.preventDefault();

  let course_code = input.value.toUpperCase();

  fetch('/time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'course_code': course_code})
    })
    .then((response) => response.json())
    .then((data) => {
      handleAjaxResponse(data);
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  document.querySelector('ul').innerHTML = '';
  searchButton.disabled = true;
  form.reset();
});

// Get JSON values of each section of the class clicked
document.querySelector('#course-container').addEventListener('click', function(event) {
  if (event.target.matches('button') && !event.target.disabled) {

    const dataId = event.target.getAttribute('data-id');

    fetch('/time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'course_id': dataId})
    })
    .then((response) => response.json())
    .then((data) => {
      handleAjaxResponse(data);
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  document.querySelector('ul').innerHTML = '';
  searchButton.disabled = true;
  form.reset();
});

//Class bubble to add
const CourseSchedule = ({ section_info, height_calc, top_size, width, course_code, color }) => {
  return (
    <div className="component-schedule container grey-default" style={{ height: height_calc, top: top_size, width: width, backgroundColor: color }}>
      <div className="column mt-1">
        <div className="row"><span>{course_code}</span></div>
        <div className="row"><span>{section_info.teacher}</span></div>
        <div className="row"><span>{section_info.section}</span></div>
      </div>
    </div>
  );
};

//React component for adding courses
class CourseItem extends React.Component {
  constructor(props) {
    super(props);
    this.toggleSections = this.toggleSections.bind(this);
    this.selectSection = this.selectSection.bind(this);
    this.unselectSection = this.unselectSection.bind(this);
    this.checkTimeConflict = this.checkTimeConflict.bind(this);
  }

  //To show all sections
  toggleSections() {
    const { course, toggleSections } = this.props;
    toggleSections(course.course_code);
  }

  //To select a section
  selectSection(sectionIndex) {
    const { course, selectSection, selectedSection} = this.props;
    if (selectedSection === sectionIndex) {
      this.unselectSection();
    } else {
      selectSection(course.course_code, sectionIndex);
    }
  }

  //To deselect a section
  unselectSection() {
    const { course, unselectSection } = this.props;
    unselectSection(course.course_code);
  }

  //Function to check sechedule conflict
  checkTimeConflict(section) {
    const { course, selectedSections, checkTimeConflict } = this.props;
    if (section.schedule !== undefined) {
      if ((selectedSections[course.course_code] === null) || (selectedSections[course.course_code] === undefined)) {
        return checkTimeConflict(section);
    }
  }
    return false;
  }


  render() {
    const { course, visibleSections, selectedSection, removeCourse, showSchedule, color } = this.props;
    const showSections = visibleSections.includes(course.course_code);
    const selectedSectionData = selectedSection !== null
      ? course.sections[selectedSection].schedule
      : null;


    return (
      <div className="course-item">
        <div className="d-flex flex-row justify-content-between courses-added course-main-header align-items-center">
          <div className="d-flex">
            <button
              onClick={this.toggleSections}
              className="btn btn-dark"
              type="button"
              style={{ '--bs-btn-padding-y': '.25rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '1rem'}}
            >
              <i className="fa fa-sort-desc" aria-hidden="true"></i>
            </button>
            <div className="d-flex course-main-code">
              <h4 style={{ color: color }}>{course.course_code}</h4>
            </div>
          </div>
          <div className="d-flex">
            <button
              onClick={() => removeCourse(course.course_code)}
              className="btn btn-dark"
              style={{ '--bs-btn-padding-y': '.25rem', '--bs-btn-padding-x': '.5rem', '--bs-btn-font-size': '.75rem' }}
            >
              <i className="fa fa-times fa-fw" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        {showSections && (
          <div id={`sections-${course.course_code}`} className="sections courses-added">
            {course.sections.map((section, index) => {
              const isVisible = selectedSection === index;
              const conflict = this.checkTimeConflict(section);
              return (
                <div
                  key={index}
                  id={`${section.section}-${course.course_code}`}
                  className={`section mb-2 pl-1 pb-1 pt-1 light-background collapser ${isVisible || selectedSection === null ? '' : 'hide'} ${conflict ? 'disabled-sections-red' : ''}`}
                >

                  <div className="d-flex container">
                    <div className="d-flex flex-column col-md-10">
                      <div className="d-flex flex-row"><span id="course-title-added">{section.course_full_title}</span></div>
                      <div className="d-flex flex-row"><span><i className="fa fa-user-o" aria-hidden="true"></i>{section.teacher}</span></div>
                      <div className="d-flex flex-row"><span><i className="fa fa-puzzle-piece" aria-hidden="true"></i>{section.section}</span></div>

                      {section.comment && <div className="d-flex flex-row"><span className={conflict ? 'disabled-sections-red' : 'text-pop-bright'}>Comment: {section.comment}</span></div>}
                      {section.schedule &&
                        <div className="mt-1 mb-2">
                          {section.schedule.Monday && <div className="d-flex flex-row"><span>Monday: {section.schedule.Monday}</span></div>}
                          {section.schedule.Tuesday && <div className="d-flex flex-row"><span>Tuesday: {section.schedule.Tuesday}</span></div>}
                          {section.schedule.Wednesday && <div className="d-flex flex-row"><span>Wednesday: {section.schedule.Wednesday}</span></div>}
                          {section.schedule.Thursday && <div className="d-flex flex-row"><span>Thursday: {section.schedule.Thursday}</span></div>}
                          {section.schedule.Friday && <div className="d-flex flex-row"><span>Friday: {section.schedule.Friday}</span></div>}
                        </div>
                      }

                    </div>
                    {section.schedule &&
                      <div className="d-flex flex-column justify-content-center">
                        <button
                          onClick={() => this.selectSection(index)}
                          className={`btn btn-dark ${conflict ? 'hide' : ''}`}
                          type="button"
                          style={{ '--bs-btn-padding-y': '0.5rem', '--bs-btn-padding-x': '0.75rem', '--bs-btn-font-size': '1rem' }}
                        >
                          {isVisible ? <i className="fa fa-minus" aria-hidden="true"></i> : <i className="fa fa-plus" aria-hidden="true"></i>}
                        </button>
                      </div>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showSchedule[course.course_code] && selectedSectionData && Object.keys(selectedSectionData).map((day, index) => {
          const time = selectedSectionData[day];

          if (time) {
            let timeRange = time;
            let times = timeRange.split(" - ");
            let start = times[0].split(":");
            let startHour = parseInt(start[0]);
            let startMinutes = parseInt(start[1]);

            let end = times[1].split(":");
            let endHour = parseInt(end[0]);
            let endMinutes = parseInt(end[1]);

            let totalStartMinutes = startHour * 60 + startMinutes;
            let totalEndMinutes = endHour * 60 + endMinutes;
            let duration = (totalEndMinutes - totalStartMinutes) / 60;

            let element = document.querySelector('.grid-cell');
            let height = element.getBoundingClientRect().height;
            let width = element.offsetWidth;
            let top_size = '0%';
            if (start[1] === '30') {
              start[1] = '00';
              times[0] = start.join(":");
              top_size = '50%';
            }
            const height_calc = duration * height;

            return ReactDOM.createPortal(
              <CourseSchedule
              key={index}
              section_info={course.sections[selectedSection]}
              height_calc={height_calc} top_size={top_size}
              width={width}
              course_code={course.course_code}
              color = {color}/>,
              document.getElementById(`${day}-${times[0]}`)
            );
          }
          return null;
        })}
      </div>
    );
  }
}

//React component with all the functions and arrays/objects for managing courses
class CourseList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { courses: [], visibleSections: [], selectedSections: {}, showSchedule: {}, colorClasses: {},
      startTimes: {'Monday': {}, 'Tuesday': {}, 'Wednesday': {}, 'Thursday': {}, 'Friday': {}},
      endTimes: {'Monday': {}, 'Tuesday': {}, 'Wednesday': {}, 'Thursday': {}, 'Friday': {}},
      colorsAvailable: ['rgba(0,120,255,0.9)', 'rgba(225,60,0,0.9)', 'rgba(0,225,60,0.9)', 'rgba(0,185,220,0.9)', 'rgba(225, 225, 75, 0.9)', 'rgba(180,180,255,0.9)',
      'rgba(200,240,220,0.9)', 'rgba(255,200,200)', 'rgba(180, 150, 255, 0.9)', 'rgba(70, 130, 180, 0.9)', 'rgba(255, 218, 150, 0.9)' ] };
    this.addCourse = this.addCourse.bind(this);
    this.toggleSections = this.toggleSections.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
    this.selectSection = this.selectSection.bind(this);
    this.unselectSection = this.unselectSection.bind(this);
    this.checkTimeConflict = this.checkTimeConflict.bind(this);
  }

  //Helper function to check conflict
  checkTimeConflict(section) {
    const { startTimes, endTimes } = this.state;

    for (const day of Object.keys(section.schedule)) {
      const time = section.schedule[day];

      if (time !== null) {
        const times = time.split(" - ");
        const start = parseInt(times[0].replace(":", ""));
        const end = parseInt(times[1].replace(":", ""));

      if (startTimes[day] !== null) {
        for (const courseTimes of Object.keys(startTimes[day])) {
          if (startTimes[day][courseTimes]) {
            const selectedStart = startTimes[day][courseTimes];
            const selectedEnd = endTimes[day][courseTimes];

            if ((start < selectedEnd) && (selectedStart < end)) {
              return true;
            };
        }}};
    }};
    return false;
  }

  //Add a course to arrays
  addCourse(data) {
    const newCourse = { course_code: data[0].course_code,
    sections: data.slice(1)
     };
    this.setState((prevState) => ({
      courses: [newCourse, ...prevState.courses],
      visibleSections: [...prevState.visibleSections, newCourse.course_code],
      selectedSections: { ...prevState.selectedSections, [newCourse.course_code]: null },
      colorClasses: { ...prevState.colorClasses, [newCourse.course_code]: this.state.colorsAvailable[0] },
      colorsAvailable: this.state.colorsAvailable.slice(1)
    }));
  }

  //Toggle all sections modification of arrays
  toggleSections(course_code) {
    this.setState((prevState) => {
      const visibleSections = prevState.visibleSections.includes(course_code)
        ? prevState.visibleSections.filter((code) => code !== course_code)
        : [...prevState.visibleSections, course_code];
      return { visibleSections };
    });
  }

  //Remove course from arrays
  removeCourse(course_code) {
    const copySelectedSections = {...this.state.selectedSections}
    delete copySelectedSections[course_code]
    const copyColorClasses = {...this.state.colorClasses}
    delete copyColorClasses[course_code]

    const updatedStartTimes = { ...this.state.startTimes };
    const updatedEndTimes = { ...this.state.endTimes };

    Object.keys(updatedStartTimes).forEach(day => {
      delete updatedStartTimes[day][course_code];
      delete updatedEndTimes[day][course_code];
    });

    this.setState((prevState) => ({
      courses: prevState.courses.filter((course) => course.course_code !== course_code),
      visibleSections: prevState.visibleSections.filter(code => code !== course_code),
      selectedSections: copySelectedSections,
      colorsAvailable: [ this.state.colorClasses[course_code], ...prevState.colorsAvailable ],
      colorClasses: copyColorClasses,
      showSchedule: { ...prevState.showSchedule, [course_code]: false },
      startTimes: updatedStartTimes,
      endTimes: updatedEndTimes,
    }));
  }

  selectSection(course_code, sectionIndex) {
    const course = this.state.courses.filter((course) => course.course_code === course_code);
    const section = course[0].sections[sectionIndex].schedule;

    const updatedStartTimes = { ...this.state.startTimes };
    const updatedEndTimes = { ...this.state.endTimes };

    Object.keys(section).forEach((day) => {

      let time = section[day];
      if (time) {
        const times = time.split(" - ");
        const start = parseInt(times[0].replace(":", ""));
        const end = parseInt(times[1].replace(":", ""));

        updatedStartTimes[day][course_code] = start;
        updatedEndTimes[day][course_code] = end;
      }
    });

    this.setState((prevState) => ({
      selectedSections: { ...prevState.selectedSections, [course_code]: sectionIndex },
      showSchedule: { ...prevState.showSchedule, [course_code]: true },
      startTimes: updatedStartTimes,
      endTimes: updatedEndTimes,
    }));
  }

  //Unselect a section modification from arrays
  unselectSection(course_code) {
    const updatedStartTimes = { ...this.state.startTimes };
    const updatedEndTimes = { ...this.state.endTimes };

    Object.keys(updatedStartTimes).forEach(day => {
      delete updatedStartTimes[day][course_code];
      delete updatedEndTimes[day][course_code];
    });

    this.setState((prevState) => ({
      selectedSections: { ...prevState.selectedSections, [course_code]: null },
      showSchedule: { ...prevState.showSchedule, [course_code]: false },
      startTimes: updatedStartTimes,
      endTimes: updatedEndTimes,
    }));
  }


  render() {
    const { courses, visibleSections, selectedSections, showSchedule, colorClasses, startTimes, endTimes } = this.state;
    return (
      <div id="course-list">
        {this.state.courses.map((course, index) => (
          <CourseItem
            key={index}
            course={course}
            removeCourse={this.removeCourse}
            toggleSections={this.toggleSections}
            selectSection={this.selectSection}
            visibleSections={visibleSections}
            selectedSection={selectedSections[course.course_code]}
            unselectSection={this.unselectSection}
            showSchedule = {showSchedule}
            selectedSections={selectedSections}
            color={colorClasses[course.course_code]}
            startTimes={startTimes}
            endTimes={endTimes}
            checkTimeConflict={this.checkTimeConflict}
          />
        ))}
      </div>
    );
  }


}

const courseListContainer = document.getElementById('classes-added');
const courseListComponent = ReactDOM.render(<CourseList />, courseListContainer);

function handleAjaxResponse(data) {
  courseListComponent.addCourse(data);
}

