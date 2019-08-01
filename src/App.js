import React from 'react';
import './App.css';


class App extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         calendar: [],
         selectedItemId: null,
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

   onDayBefore = () => {

   }

   onDayAfter = () => {

   }

   showData = (date) => {
      console.log(this.state.currentDay);
      if (this.state.currentDay === date) {
         return true;
      } else {
         return false;
      }
   }


   render() {
      const calendar = this.state.calendar;
      return (
         <>
            <div className="App">
               {calendar.length > 0 ?
                  <div>
                     <div className="div-inline">
                        <p>Choose timeslot</p>
                        {calendar[0].timeslots.map(t => (
                           <p key={t.id}>{`${t.from} - ${t.to}`}</p>
                        ))}
                     </div>
                     {calendar.map(c => (
                        <div key={c.date} className={`div-inline 
                     ${() => this.showData(c.date) ? 'hide' : ''}`}
                        >
                           <p>{c.date}</p>
                           {c.timeslots.map(t => (
                              <p key={t.id}
                                 className={` ${t.id === this.state.selectedItemId ? 'selected-item' : ''}
                                 ${t.status === 'free' ? 'status-selected' : ''}`}
                                 onClick={t.status === 'free' ? () => this.onSelectItem(t.id) : null}
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
            <button className='btn' onClick={this.onDayBefore}>{'<'}</button>
            <button className='btn' onClick={this.onDayAfter}>{'>'}</button>
         </>
      );
   }
}

export default App;
