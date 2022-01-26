import React, { useState } from "react";
import cloneDeep from "lodash.clonedeep";
import {
  CenteredForm,
  FullWidthFormGroup,
  FullWidthFormRow,
} from "../../styles/global";
import Form from "react-bootstrap/Form";
import DayPicker from "react-day-picker";
import { DEFAULT_WEBSITE_EVENT } from "../../util/config";
import Button from "react-bootstrap/Button";

const EventForm = ({ initialFormData, submitFunction, SubmitButton }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [startDays, setStartDays] = useState([]);
  const [endDays, setEndDays] = useState([]);

  const [validated, setValidated] = useState(false);

  const saveLevel = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
    } else {
      submitFunction(cloneDeep(formData));
      setValidated(false);
    }
  };

  return (
    <CenteredForm noValidate validated={validated} onSubmit={saveLevel}>
      <FullWidthFormRow>
        <FullWidthFormGroup controlId="title">
          <Form.Label>
            <h5>Title</h5>
          </Form.Label>
          <Form.Control
            name="event.title"
            type="text"
            placeholder="Enter event title..."
            value={formData.event.title}
            onChange={(e) => {
              const cloned = cloneDeep(formData);
              cloned.event.title = e.target.value;
              setFormData(cloned);
            }}
            required
          />
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <FullWidthFormRow>
        <FullWidthFormGroup controlId="allDay">
          <Form.Label>
            <h5>Is this an All Day Event?</h5>
          </Form.Label>
          <Form.Check
            custom
            checked={formData.website.allDay}
            type="switch"
            label="test"
            id="website.allDay"
            onChange={(e) => {
              const cloned = cloneDeep(formData);
              cloned.website.allDay = !formData.website.allDay;
              setFormData(cloned);
            }}
          />
        </FullWidthFormGroup>
      </FullWidthFormRow>

      <FullWidthFormRow>
        <FullWidthFormGroup controlId="startTime">
          <Form.Label>
            <h5> {!formData.website.allDay ? "Start Time" : "Event Day"} </h5>
          </Form.Label>
          {!formData.website.allDay && (
            <Form.Control
              type="time"
              placeholder="Enter Start Time..."
              step="18000"
              value={formData.website.startHour
                .padStart(2, "0")
                .concat(":", formData.website.startMinute.padStart(2, "0"))}
              onChange={(e) => {
                const cloned = cloneDeep(formData);
                cloned.website.startHour = e.target.value.split(":")[0];
                cloned.website.startMinute = e.target.value.split(":")[1];
                setFormData(cloned);
              }}
            />
          )}

          <br />

          <DayPicker
            initialMonth={new Date()}
            selectedDays={startDays}
            onDayClick={(day, { selected }) => {
              if (selected) {
                setStartDays([]);
                const cloned = cloneDeep(formData);
                cloned.website.startMonth = DEFAULT_WEBSITE_EVENT.startMonth;
                cloned.website.startDay = DEFAULT_WEBSITE_EVENT.startDay;
                cloned.website.startYear = DEFAULT_WEBSITE_EVENT.startYear;
                setFormData(cloned);
              } else {
                let tempDays = [];
                tempDays.push(day);
                setStartDays(tempDays);
                const cloned = cloneDeep(formData);
                cloned.website.startMonth = String(day.getMonth() + 1);
                cloned.website.startDay = String(day.getDate());
                cloned.website.startYear = String(day.getFullYear());
                setFormData(cloned);
              }
            }}
          />
          {startDays.length > 0 && (
            <Button
              onClick={() => {
                setStartDays([]);
              }}
            >
              Clear
            </Button>
          )}
        </FullWidthFormGroup>
      </FullWidthFormRow>

      {!formData.website.allDay && (
        <FullWidthFormRow>
          <FullWidthFormGroup controlId="endTime">
            <Form.Label>
              <h5>End Time</h5>
            </Form.Label>
            <Form.Control
              type="time"
              placeholder="Enter End Time..."
              step="18000"
              value={formData.website.endHour
                .padStart(2, "0")
                .concat(":", formData.website.endMinute.padStart(2, "0"))}
              onChange={(e) => {
                const cloned = cloneDeep(formData);
                cloned.website.endHour = e.target.value.split(":")[0];
                cloned.website.endMinute = e.target.value.split(":")[1];
                setFormData(cloned);
              }}
            />
            <DayPicker
              initialMonth={new Date()}
              selectedDays={endDays}
              onDayClick={(day, { selected }) => {
                if (selected) {
                  setEndDays([]);
                  const cloned = cloneDeep(formData);
                  cloned.website.endMonth = DEFAULT_WEBSITE_EVENT.endMonth;
                  cloned.website.endDay = DEFAULT_WEBSITE_EVENT.endDay;
                  cloned.website.endYear = DEFAULT_WEBSITE_EVENT.endYear;
                  setFormData(cloned);
                } else {
                  let tempDays = [];
                  tempDays.push(day);
                  setEndDays(tempDays);
                  const cloned = cloneDeep(formData);
                  cloned.website.endMonth = String(day.getMonth() + 1);
                  cloned.website.endDay = String(day.getDate());
                  cloned.website.endYear = String(day.getFullYear());
                  setFormData(cloned);
                }
              }}
            />
            {endDays.length > 0 && (
              <Button
                onClick={() => {
                  setEndDays([]);
                }}
              >
                Clear
              </Button>
            )}
          </FullWidthFormGroup>
        </FullWidthFormRow>
      )}

      <SubmitButton />
    </CenteredForm>
  );
};

export default EventForm;
