import * as React from 'react';
import './App.css';


const daysPerPage = 3;

interface State {
   calendar: [
      {
         date: string,
         timeslots: [
            {
               from: string,
               to: string,
               id: string,
               status: string
            }
         ]
      }
   ],
   numberOfSelectedItems: number,
   hover: boolean,
   hoverItemId: string,
   selectedItemId: string,
   selectedDayIndex: number,
   boldedTime: string,
   currentDay: any
}

class App extends React.Component<any, State> {

   constructor(props: any) {
      super(props);
      this.state = {
         calendar: [] as any,
         numberOfSelectedItems: 1,
         hover: false,
         hoverItemId: '',
         selectedItemId: '',
         selectedDayIndex: 0,
         boldedTime: '',
         currentDay: null         
      };
      this.onSelectItem = this.onSelectItem.bind(this);
      this.onDayBefore = this.onDayBefore.bind(this);
      this.onDayAfter = this.onDayAfter.bind(this);
      this.showData = this.showData.bind(this);
      this.onSelectChange = this.onSelectChange.bind(this);
      this.toggleHover = this.toggleHover.bind(this);
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

   onSelectChange = (e: React.FormEvent<HTMLSelectElement>) => {      
      const value = +e.currentTarget.value;
      this.setState(state => ({
         ...state,
         numberOfSelectedItems: value
      }));
   }

   toggleHover = ( day: any, timeslot: any, e: React.FormEvent<HTMLParagraphElement>) => {  
         if (timeslot.status !== 'free') {
            return;
         }

         const {numberOfSelectedItems} = this.state;
         let statuses = day.timeslots.map((t: any) => t.status);
         console.log('statuses', statuses);       
         
         this.check(statuses, numberOfSelectedItems);
        
         let newId = e.type === 'mouseenter' ? timeslot.id : '';

         this.setState(state => ({
            ...state,
            hover: !state.hover,
            hoverItemId: newId
         }))
   }

   check = (statuses: string[], numberOfSelectedItems: number) => {
      return true;
   }

   onSelectItem = (id: string, fromTime: string) => {
      const {hoverItemId} = this.state;
      console.log(`id: ${id}, hoverItemId: ${hoverItemId}`);
      // setuj u toogle hoverItemsIds i onda ih ovde ubaci u selectedItemsIds
      // posle setuj boldedTimes
      this.setState(state => ({
         ...state,
         selectedItemId: id,
         boldedTime: fromTime
      }));
   }

   getDaysForDisplay(allDays: any, currentIndex: number) {
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
      const { selectedDayIndex } = this.state;
      if (selectedDayIndex < 1) {
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
      const { calendar, selectedDayIndex } = this.state;
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

   showData = (date: string) => {
      return this.state.currentDay === date;
   }


   render() {
      const { 
         calendar, 
         selectedItemId, 
         selectedDayIndex, 
         boldedTime, 
         numberOfSelectedItems,
         hover,
         hoverItemId
      } = this.state;
      let days;
      
      if (calendar && calendar.length > 0) {
         days = this.getDaysForDisplay(calendar, selectedDayIndex);
      }
      return (
         <>
         {calendar && calendar.length > 0 ?
            <div className="App">
               <select className='select' onChange={(e) => this.onSelectChange(e)} 
                  value={numberOfSelectedItems}>
                  <option value={1}>1</option>
                  <option value={3}>3</option>
                  <option value={6}>6</option>
               </select>
               <button id='btn-left' onClick={this.onDayBefore}>{'<'}</button>
               <button id='btn-right' onClick={this.onDayAfter}>{'>'}</button>
       
               <div>
                  <div className="div-inline">
                     <p className="header-date">Choose timeslot</p>
                     {calendar[0].timeslots.map((t: any) => (
                        <p className={boldedTime === t.from ? 'bold' : ''} key={t.id}>
                           {`${t.from} - ${t.to}`}
                        </p>
                     ))}
                  </div>

                  {days.map((day, index) => (
                     <div key={index} className={`div-inline 
                     ${() => this.showData(day.date) ? 'hide' : ''}`}
                     >
                        <p className="header-date">{day.date}</p>
                        {day.timeslots.map((t: any) => (
                           // cell element
                           <p key={t.id} 
                              onMouseEnter={(e) => this.toggleHover(day, t, e)} 
                              onMouseLeave={(e) => this.toggleHover(day, t, e)}
                              className={` 
                              ${t.id === selectedItemId ? 'selected-item' : ''}
                              ${t.status === 'free' && hover && t.id === hoverItemId && 'status-selected'} 
                              `}
                              onClick={t.status === 'free' ?
                                 () => this.onSelectItem(t.id, t.from) : null}
                           >
                              {t.status}
                           </p>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
            :
            'empty calendar'}
         </>
      );
   }
}

export default App;
