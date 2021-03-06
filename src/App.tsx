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
   hoverItemsIds: string[],
   selectedItemsIds: string[],
   selectedDayIndex: number,
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
         hoverItemsIds: [] as any,
         selectedItemsIds: [] as any,
         selectedDayIndex: 0,
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

   toggleHover = (day: any, timeslot: any,
      e: React.FormEvent<HTMLParagraphElement>, index: number) => {
      if (timeslot.status !== 'free') {
         return;
      }

      let statuses = day.timeslots.map((t: any) => t.status);

      let selectedIds = this.getHoveredIds(
         statuses,
         day.timeslots,
         timeslot.id,
         index
      );
      selectedIds = e.type === 'mouseenter' ? selectedIds : [] as any;

      this.setState(state => ({
         ...state,
         hover: !state.hover,
         hoverItemsIds: selectedIds
      }));
   }

   getHoveredIds = (statuses: string[], timeslots: any, currentId: string, currentIndex: number) => {
      const { numberOfSelectedItems } = this.state;
      let ids: string[] = [] as any;

      switch (numberOfSelectedItems) {
         case 1:
            ids.push(currentId);
            break;

         case 3:
            ids = this.getIdsFor3InSelect(timeslots, currentIndex);           
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

   getIdsFor3InSelect = (timeslots: any, currentIndex: number) => {
      // When 3 is selected in select - this chec is run
      let allTimesFrom: any[] = timeslots.map((t: any, index: any) => {
         return {
            from: t.from,
            id: t.id,
            listIndex: index,
            status: t.status
         }
      });
      
      let ids: string[] = [] as any;
      allTimesFrom.forEach((t: any, index: number) => {
         // is first
         if (currentIndex === 0 &&  currentIndex === t.listIndex && 
            allTimesFrom[index + 1] && allTimesFrom[index + 1].status === 'free' &&
            allTimesFrom[index + 2] && allTimesFrom[index + 2].status === 'free'
         ) {
            ids.push(t.id);
            ids.push(allTimesFrom[index + 1].id);
            ids.push(allTimesFrom[index + 2].id);
         }

         // is last
         else if (currentIndex === allTimesFrom.length - 1 
            && currentIndex === t.listIndex &&
            allTimesFrom[index - 1] && allTimesFrom[index - 1].status === 'free' &&
            allTimesFrom[index - 2] && allTimesFrom[index - 2].status === 'free'
         ) {
            ids.push(t.id);
            ids.push(allTimesFrom[index - 1].id);
            ids.push(allTimesFrom[index - 2].id);
         }

         // in the middle
         else if (currentIndex > 0 && currentIndex < allTimesFrom.length - 1 && 
            currentIndex === t.listIndex)  {
            if (allTimesFrom[index + 1] && allTimesFrom[index + 1].status === 'free' &&
            allTimesFrom[index + 2] && allTimesFrom[index + 2].status === 'free') {
               ids.push(t.id);
               ids.push(allTimesFrom[index + 1].id);
               ids.push(allTimesFrom[index + 2].id);  
            } else if (allTimesFrom[index + 1] && allTimesFrom[index + 1].status === 'free' &&
            allTimesFrom[index - 1] && allTimesFrom[index - 1].status === 'free') {
               ids.push(t.id);
               ids.push(allTimesFrom[index + 1].id);
               ids.push(allTimesFrom[index - 1].id);
            } else if (allTimesFrom[index - 1] && allTimesFrom[index - 1].status === 'free' &&
            allTimesFrom[index - 2] && allTimesFrom[index - 2].status === 'free') {
               ids.push(t.id);
               ids.push(allTimesFrom[index - 1].id);
               ids.push(allTimesFrom[index - 2].id);
            }
         }
      });

      return ids;
   }

   onSelectItem = (timeslots: any, currentIndex: number) => {
      const { hoverItemsIds, numberOfSelectedItems } = this.state;

      if (numberOfSelectedItems === 6) {
         let statuses = timeslots.map((t: any) => t.status);
         let filteredStatuses = statuses.filter((s: any) => s === 'free');
         if (filteredStatuses.length !== statuses.length) {
            return;
         }         
      }
      if (numberOfSelectedItems === 3) {
         let ids = this.getIdsFor3InSelect(timeslots, currentIndex);
         if (ids.length === 0) {
            return;
         }
      } 

      let allTimesFrom = timeslots.map((t: any, index: number) => {
         return {
            from: t.from,
            id: t.id,
            listIndex: index,
            status: t.status
         }
      });     


      let bolded: string[] = [] as any;     
      
      allTimesFrom.forEach((t: any) => {
         if (hoverItemsIds.includes(t.id)) {
            bolded.push(t.from);
         }
      });

      this.setState(state => ({
         ...state,
         selectedItemsIds: hoverItemsIds,
         boldedTimes: bolded
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
         selectedItemsIds,
         selectedDayIndex,
         boldedTimes,
         numberOfSelectedItems,
         hover,
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
                           {day.timeslots.map((t: any, index: number) => (
                              // cell element
                              <p key={t.id}
                                 onMouseEnter={(e) => this.toggleHover(day, t, e, index)}
                                 onMouseLeave={(e) => this.toggleHover(day, t, e, index)}
                                 className={` 
                              ${selectedItemsIds.includes(t.id) ? 'selected-item' : ''}

                              ${hover && hoverItemsIds.includes(t.id) && 'hover'}

                              `}
                                 onClick={t.status === 'free' ?
                                    () => this.onSelectItem(day.timeslots, index) : null}
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
