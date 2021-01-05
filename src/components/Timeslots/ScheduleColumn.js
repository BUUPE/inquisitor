import React, { useState } from "react";
import styled from "styled-components";

import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";

import { formatTime } from "../../util/helper";

const borderStyle = "1px solid black";
const StyledSlot = styled.div`
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  background: ${(props) => {
    if (props.userSelected) return "green";
    else if (props.hasOpening) return "blue";
    else if (props.orphanedApplicant) return "red";
    else return "white";
  }};
  border-left: ${borderStyle};
  border-right: ${borderStyle};
  border-top: ${(props) =>
    props.isBottom || props.isMiddle ? "none" : borderStyle};
  border-bottom: ${(props) =>
    props.isTop || props.isMiddle ? "none" : borderStyle};

  ${(props) => {
    if (props.userSelected) return;
    let css = `
      &:hover {
        background: rgba(0, 128, 0, 0.5);
        border-bottom: none;
      }
    `;
    let siblingSelector = " + div";
    for (let i = 1; i < props.slotsPerTimeslot; i++) {
      css += `&:hover ${siblingSelector} {
        background: rgba(0, 128, 0, 0.5);
        border-top: none;
        border-bottom: ${
          i + 1 === props.slotsPerTimeslot ? borderStyle : "none"
        };
      }`;
      siblingSelector += " + div";
    }
    return css;
  }}
`;

const ScheduleColumn = ({
  date,
  timeslotLength,
  userSelectedSlots,
  slotsWithOpening,
  orphanedApplicants,
  selectTimeslot,
  unselectTimeslot,
  startHour,
  endHour,
  offsetHours,
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

    const { isSelected, isTop, isMiddle, isBottom } = getPositions(
      slot,
      userSelectedSlots
    );

    const SlotBase = ({ children }) => (
      <StyledSlot
        slotsPerTimeslot={slotsPerTimeslot}
        hasOpening={slotsWithOpening.hasOwnProperty(slot)}
        userSelected={userSelectedSlots.hasOwnProperty(slot)}
        orphanedApplicant={orphanedApplicants.hasOwnProperty(slot)}
        isTop={isTop}
        isMiddle={isMiddle}
        isBottom={isBottom}
        onClick={() => handleSelect(slot, i)}
      >
        {children}
      </StyledSlot>
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
      <SlotBase key={slot}>
        <span>{formatTime(dateFromSlot(slot))}</span>
        <span>-</span>
        <span>{formatTime(dateFromSlot(slot + 15))}</span>
      </SlotBase>
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
