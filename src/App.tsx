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
   hoverItemsIds: string[],

   selectedItemId: string,
   selectedItemsIds: string[],

   selectedDayIndex: number,

   boldedTime: string,
   boldedTimes: string[], 

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
         hoverItemsIds: [] as any,
         selectedItemId: '', 
         selectedItemsIds: [] as any,        
         selectedDayIndex: 0,
         boldedTime: '',
         boldedTimes: [] as any,
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

         const { numberOfSelectedItems } = this.state;
         let statuses = day.timeslots.map((t: any) => t.status);
         console.log('statuses', statuses);       
         
         let ids = this.getIds(
            statuses,
            numberOfSelectedItems, 
            day.timeslots, 
            timeslot.id
         );
         ids = e.type === 'mouseenter' ? ids : [] as any;

         let newId = e.type === 'mouseenter' ? timeslot.id : '';         

         this.setState(state => ({
            ...state,
            hover: !state.hover,
            hoverItemId: newId,
            hoverItemsIds: ids
         }))
   }

   getIds = (statuses: string[], numberOfSelectedItems: number, 
      timeslots: any, currentId: string) => {
      console.log('check', statuses);
      let ids: string[] = [] as any;

      // currentIndex of hover      
      switch (numberOfSelectedItems) {
         case 1:
            ids.push(currentId);
            break;

         case 3:
            
            break;

         case 6:
            let filteredStatuses = statuses.filter(s => s === 'free');
            if (filteredStatuses.length === statuses.length) {
               timeslots.forEach((t: any) => {
                  ids.push(t.id);
               })
            }
            break;
      
         default:
            break;
      }



      return ids;
   }

   onSelectItem = (timeslots: any) => {
      const { hoverItemsIds } = this.state;
      let allTimesFrom = timeslots.map((t: any) => {
         return {
            from: t.from,
            id: t.id
         }});
      let response: string[] = [] as any;
      allTimesFrom.forEach((t: any) => {
         if (hoverItemsIds.includes(t.id)) {
            response.push(t.from);
         }
      });

      console.log('response', response);
      
      this.setState(state => ({
         ...state,
         selectedItemsIds: hoverItemsIds,
         boldedTimes: response
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
         // selectedItemId, 
         selectedItemsIds,
         selectedDayIndex, 
         // boldedTime, 
         boldedTimes,
         numberOfSelectedItems,
         hover,
         // hoverItemId,
         hoverItemsIds
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
                        <p className={boldedTimes.includes(t.from) ? 'bold' : ''} key={t.id}>
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
                              ${selectedItemsIds.includes(t.id) ? 'selected-item' : ''}
                              ${t.status === 'free' && hover && hoverItemsIds.includes(t.id) && 'status-selected'}

                              `}
                              onClick={t.status === 'free' ?
                                 () => this.onSelectItem(day.timeslots) : null}
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
