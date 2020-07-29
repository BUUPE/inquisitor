import React, { useState, useEffect } from "react";

import Col from "react-bootstrap/Col";

// selecting anything other than first slot picks everything
const ScheduleColumn = ({ date, timeslotLength }) => {
  // selectedSlots is an object/hashmap for performance reasons
  const [selectedSlots, setSelectedSlots] = useState({});

  const startHour = 8; // 8 am
  const endHour = 22; // 10 pm
  const numSlots = (endHour - startHour) * 4; // 15 min slots
  const slots = Array.from(Array(numSlots), (_, i) => i * 15); // total 15 min slots in a day
  const slotsPerTimeslot = timeslotLength / 15; // number of 15 min slots in an interview

  // converts selectedSlots to array of dates that can be saved in firebase
  const getTimeslots = () =>
    Array.from(
      // create a set of the start offsets for timeslots (removes duplicates)
      new Set(Object.values(selectedSlots).map((timeslot) => timeslot[0]))
    ).map(
      (offset) =>
        // turn start offset (which is in minutes) into a Date object
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          startHour + Math.floor(offset / 60),
          offset % 60
        )
    );

  // converts a start offset (slot) into a Date object
  const dateFromSlot = (slot) => {
    const hours = startHour + Math.floor(slot / 60);
    const minutes = slot % 60;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
  };

  // formats a date into a AM/PM time string
  const formatTime = (date) => {
    let hours = date.getHours() % 12;
    if (hours === 0) hours = 12;
    hours = hours.toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes} ${date.getHours() >= 12 ? "PM" : "AM"}`;
  };

  const handleSelect = (slot, i) => {
    const validateSlot = (slot, i) => {
      // if the timeslot will overflow past 10 PM, it's invalid
      if (i + slotsPerTimeslot > slots.length) return false;

      // if the timeslot will overflow into an already selected timeslot, it's invalid
      const end = slot + timeslotLength;
      for (let pos = slot; pos < end; pos += 15) {
        if (selectedSlots.hasOwnProperty(pos)) return false;
      }

      // otherwise it's valid
      return true;
    };

    if (selectedSlots.hasOwnProperty(slot)) {
      // if slot is already selected, remove it and associated ones
      const newSlots = { ...selectedSlots };
      const start = newSlots[slot][0];
      const end = newSlots[slot][1];
      for (let pos = start; pos <= end; pos += 15) {
        delete newSlots[pos];
      }
      return setSelectedSlots(newSlots);
    } else if (validateSlot(slot, i)) {
      // if slot isn't selected and is valid, select it and the rest in its timeslot
      const newSlots = { ...selectedSlots };
      const end = slot + timeslotLength - 15;
      for (let pos = slot; pos <= end; pos += 15) {
        newSlots[pos] = [slot, end];
      }
      return setSelectedSlots(newSlots);
    }

    // otherwise show the user an error
    console.error("cant pick that!");
  };

  const renderSlot = (slot, i) => {
    const getPositions = (slot) => {
      const isSelected = selectedSlots.hasOwnProperty(slot);
      const isTop = isSelected && slot === selectedSlots[slot][0];
      const isMiddle = isSelected && !selectedSlots[slot].includes(slot);
      const isBottom = isSelected && slot === selectedSlots[slot][1];
      return {
        isSelected,
        isTop,
        isMiddle,
        isBottom,
      };
    };

    const generateSlotStyle = (slot) => {
      const baseStyle = {
        padding: 10,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
      };

      const { isTop, isMiddle, isBottom } = getPositions(slot);
      const borderStyle = "1px solid black";

      return {
        ...baseStyle,
        borderLeft: borderStyle,
        borderRight: borderStyle,
        borderTop: isBottom || isMiddle ? "none" : borderStyle,
        borderBottom: isTop || isMiddle ? "none" : borderStyle,
        background: selectedSlots.hasOwnProperty(slot) ? "green" : "white",
      };
    };

    const { isSelected, isTop, isMiddle, isBottom } = getPositions(slot);

    const SlotBase = ({ children }) => (
      <div
        style={{
          ...generateSlotStyle(slot),
        }}
        onClick={() => handleSelect(slot, i)}
      >
        {children}
      </div>
    );

    if (isSelected) {
      if (isTop) {
        return (
          <SlotBase key={slot}>
            <span>{formatTime(dateFromSlot(slot))}</span>
          </SlotBase>
        );
      } else if (isMiddle) {
        return <SlotBase key={slot}>-</SlotBase>;
      } else if (isBottom) {
        return (
          <SlotBase key={slot}>
            <span>{formatTime(dateFromSlot(slot + 15))}</span>
          </SlotBase>
        );
      }
    }

    return (
      <div
        style={{
          ...generateSlotStyle(slot),
        }}
        key={slot}
        onClick={() => handleSelect(slot, i)}
      >
        <span>{formatTime(dateFromSlot(slot))}</span>
        <span>-</span>
        <span>{formatTime(dateFromSlot(slot + 15))}</span>
      </div>
    );
  };

  return (
    <Col>
      <strong>{date.toDateString()}</strong>
      {slots.map(renderSlot)}
    </Col>
  );
};

export default ScheduleColumn;
