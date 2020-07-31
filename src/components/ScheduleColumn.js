import React, { useState } from "react";

import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";

const ScheduleColumn = ({
  date,
  timeslotLength,
  userSelectedSlots,
  slotsWithOpening,
  selectTimeslot,
  unselectTimeslot,
  startHour,
  endHour,
}) => {
  const [showToast, setShowToast] = useState(false);

  const numSlots = (endHour - startHour) * 4; // 15 min slots
  const slots = Array.from(Array(numSlots), (_, i) => i * 15); // total 15 min slots in a day
  const slotsPerTimeslot = timeslotLength / 15; // number of 15 min slots in an interview

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
        if (userSelectedSlots.hasOwnProperty(pos)) return false;
      }

      // otherwise it's valid
      return true;
    };

    if (userSelectedSlots.hasOwnProperty(slot)) {
      // if slot is already selected, tell parent to remove the associated timeslot
      const offset = userSelectedSlots[slot][0];
      return unselectTimeslot(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          startHour + Math.floor(offset / 60),
          offset % 60
        )
      );
    } else if (validateSlot(slot, i)) {
      // if slot isn't selected and is valid, tell the parent to add the associated timeslot
      const offset = slot;
      return selectTimeslot(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          startHour + Math.floor(offset / 60),
          offset % 60
        )
      );
    }

    // otherwise show the user an error
    setShowToast(true);
  };

  // TODO: render slots selected by others/with openings, show 1/2 2/2
  const renderSlot = (slot, i) => {
    const getPositions = (slot, collection) => {
      const isSelected = collection.hasOwnProperty(slot);
      const isTop = isSelected && slot === collection[slot][0];
      const isMiddle = isSelected && !collection[slot].includes(slot);
      const isBottom = isSelected && slot === collection[slot][1];
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

      const { isTop, isMiddle, isBottom } = getPositions(
        slot,
        userSelectedSlots
      );
      const borderStyle = "1px solid black";

      return {
        ...baseStyle,
        borderLeft: borderStyle,
        borderRight: borderStyle,
        borderTop: isBottom || isMiddle ? "none" : borderStyle,
        borderBottom: isTop || isMiddle ? "none" : borderStyle,
        background: userSelectedSlots.hasOwnProperty(slot) ? "green" : "white",
      };
    };

    const { isSelected, isTop, isMiddle, isBottom } = getPositions(
      slot,
      userSelectedSlots
    );

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
    <Col style={{ width: 300, flex: "none" }}>
      <div style={{ position: "fixed" }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Body>
            <strong className="mr-auto" style={{ color: "red" }}>
              Invalid option/timeslot conflict!
            </strong>
          </Toast.Body>
        </Toast>
      </div>

      <strong>{date.toDateString()}</strong>
      {slots.map(renderSlot)}
    </Col>
  );
};

export default ScheduleColumn;
