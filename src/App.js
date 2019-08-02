import React from 'react';
import './App.css';


const daysPerPage = 3;

class App extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         calendar: [],
         selectedItemId: null,
         selectedDayIndex: 0,
         currentDay: null
      };
      this.onSelectItem = this.onSelectItem.bind(this);
      this.onDayBefore = this.onDayBefore.bind(this);
      this.onDayAfter = this.onDayAfter.bind(this);
      this.showData = this.showData.bind(this);
   }

   componentDidMount() {
      fetch('https://interview-calendar-backend.herokuapp.com/api/calendar')
         .then(res => {
            if (!res.ok) {
               console.log(res);
            }
            return res.json();
         })
         .then(data => {
            this.setState(state => ({
               ...state,
               calendar: data.calendar,
               currentDay: data.calendar[0].date
            }));
         })
         .catch(error => {
            console.log('fetch error', error);
         })
   }

   onSelectItem = (id) => {
      this.setState(state => ({
         ...state,
         selectedItemId: id
      }));
   }

   getDaysForDisplay(allDays, currentIndex) {
      currentIndex = currentIndex || 0;
      const newDays = [];
      let day;

      if (allDays.length >= currentIndex + daysPerPage) {
         for (let i = 0; i < daysPerPage; i++) {
            day = allDays[currentIndex];
            newDays.push(day);
            currentIndex++;
         }
      }
      return newDays; 
   }

   onDayBefore = () => {
      const {selectedDayIndex} = this.state;
      if (selectedDayIndex < 1 ) {
         return;
      }
      let newDayIndex = selectedDayIndex;
      newDayIndex = newDayIndex - 1;
      this.setState(state => ({
         ...state,
         selectedDayIndex: newDayIndex
      }));
   }

   onDayAfter = () => {
      const {calendar, selectedDayIndex} = this.state;
      if (selectedDayIndex > -1 && calendar.length < selectedDayIndex + daysPerPage + 1) {
         return;
      }
      let newDayIndex = selectedDayIndex;
      newDayIndex = newDayIndex + 1;
      this.setState(state => ({
         ...state,
         selectedDayIndex: newDayIndex
      }));
   }

   showData = (date) => {     
      return this.state.currentDay === date;
   }


   render() {
      const { calendar, selectedItemId, selectedDayIndex } = this.state;
      let days = this.getDaysForDisplay(calendar, selectedDayIndex);
      return (
         <div className="App">
            {calendar.length > 0 &&
               <>
               <button id='btn-left' onClick={this.onDayBefore}>{'<'}</button>
               <button id='btn-right' onClick={this.onDayAfter}>{'>'}</button>
               </>
            }
            {calendar.length > 0 ?
               <div>
                  <div className="div-inline">
                     <p className="header-date">Choose timeslot</p>
                     {calendar[0].timeslots.map(t => (
                        <p key={t.id}>{`${t.from} - ${t.to}`}</p>
                     ))}
                  </div>

                  {days.map((day, index) => (
                     <div key={index} className={`div-inline 
                        ${() => this.showData(day.date) ? 'hide' : ''}`}
                     >
                        <p className="header-date">{day.date}</p>
                        {day.timeslots.map(t => (
                           <p key={t.id}
                              className={` 
                                 ${t.id === selectedItemId ? 'selected-item' : ''}
                                 ${t.status === 'free' && 'status-selected'} `}
                              onClick={t.status === 'free' ? 
                                 () => this.onSelectItem(t.id) : null}
                           >
                              {t.status}
                           </p>
                        ))}
                     </div>
                  ))}

               </div>
               :
               'empty calendar'}                  
         </div>  
      );
   }
}

export default App;
