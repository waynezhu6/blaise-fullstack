import React, { useRef } from 'react';
import styles from '../styles/Overlay.module.scss';

const Overlay = ({setLinear, from, to}) => {

  const checkbox = useRef();

  const onCheck = () => {
    if(!checkbox.current) 
      return;
    let state = checkbox.current.checked;
    setLinear(!state);
  }

  const setCheck = () => {
    if(!checkbox.current)
      return;
    checkbox.current.checked = !checkbox.current.checked;
  }

  const formatCoordinate = (coord) => {
    return `${coord.lon.toFixed(4)}, ${coord.lat.toFixed(4)}`
  }

  return(
    <div className={styles.body} onClick={(e) => e.stopPropagation()}>
      <div className={styles.filter}>
        
        <div className={styles.title}>
          Blaise Coding Challenge
        </div> 

        <div className={styles.info} style={{borderLeft: "4px solid #DD0000"}}>
          From: {formatCoordinate(from)}
        </div>

        <div className={styles.info} style={{borderLeft: "4px solid #766DB1"}}>
          To: {formatCoordinate(to)}
        </div>

        <div className={styles.checkbox}>
          <span onClick={setCheck}>View full walking route</span>
          <input type="checkbox" ref={checkbox} onClick={onCheck} defaultChecked={true}/>
        </div>

      </div>
    </div>
  );
}

export default Overlay;
