import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateEventForm.css';

const CreateEventForm = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('In person');
  const [isPrivate, setIsPrivate] = useState('false');
  const [price, setPrice] = useState('0');
  const [capacity, setCapacity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [venueId, setVenueId] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('');
  const [venueLat, setVenueLat] = useState('');
  const [venueLng, setVenueLng] = useState('');
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  const [formIncomplete, setFormIncomplete] = useState(false);
  const [groupName, setGroupName] = useState('');

  const stateAbbreviations = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  useEffect(() => {
    fetch('/api/csrf/restore', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setCsrfToken(data['XSRF-Token']);
      })
      .catch((error) => {
        console.error('Error fetching CSRF token:', error);
      });

    fetch(`/api/groups/${groupId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.name) {
          setGroupName(data.name);
        }
      })
      .catch((error) => {
        console.error('Error fetching group details:', error);
      });

    return () => {
      setName('');
      setType('In person');
      setIsPrivate('false');
      setPrice('');
      setCapacity('');
      setStartDate('');
      setEndDate('');
      setImageUrl('');
      setDescription('');
      setVenueId('');
      setVenueAddress('');
      setVenueCity('');
      setVenueState('');
      setVenueLat('');
      setVenueLng('');
      setErrors({});
      setFormIncomplete(false);
    };
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormIncomplete(false);

    const newErrors = {};

    if (!name) newErrors.name = 'Name is required';
    if (!type) newErrors.type = 'Event type is required';
    if (!isPrivate) newErrors.isPrivate = 'Visibility is required';
    if (!price) newErrors.price = 'Price is required';
    if (!capacity) newErrors.capacity = 'Capacity is required';
    if (!startDate) newErrors.startDate = 'Event start is required';
    if (!endDate) newErrors.endDate = 'Event end is required';
    if (!imageUrl) newErrors.imageUrl = 'Image URL is required';
    if (!description) newErrors.description = 'Description is required';
    if (description.length < 30) newErrors.description = 'Description needs 30 or more characters';
    if (description.length > 2000) newErrors.description = 'Description cannot exceed 2000 characters';
    if (type === 'In person' && (!venueAddress || !venueCity || !venueState)) {
      newErrors.venueAddress = 'Venue address, city, and state are required for in-person events';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormIncomplete(true);
      return;
    }

    try {
      let newVenueId = venueId;

      if (type === 'In person') {
        console.log('Posting to /api/venues with data:', {
          groupId,
          address: venueAddress,
          city: venueCity,
          state: venueState,
          lat: venueLat ? parseFloat(venueLat) : null,
          lng: venueLng ? parseFloat(venueLng) : null,
        });

        const venueResponse = await fetch('/api/venues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            groupId,
            address: venueAddress,
            city: venueCity,
            state: venueState,
            lat: venueLat ? parseFloat(venueLat) : null,
            lng: venueLng ? parseFloat(venueLng) : null,
          }),
        });

        if (venueResponse.ok) {
          const venueData = await venueResponse.json();
          newVenueId = venueData.id;
        } else {
          const venueErrorData = await venueResponse.json();
          console.error('Venue creation error:', venueErrorData);
          setErrors(venueErrorData.errors ? venueErrorData.errors : { message: venueErrorData.message });
          return;
        }
      }

      console.log('Sending event creation request with data:', {
        name,
        type,
        private: isPrivate === 'true',
        price: parseInt(price, 10),
        capacity: parseInt(capacity, 10),
        startDate,
        endDate,
        imageUrl,
        description,
        venueId: type === 'In person' ? newVenueId : null,
      });

      const eventResponse = await fetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          name,
          type,
          private: isPrivate === 'true',
          price: parseInt(price, 10),
          capacity: parseInt(capacity, 10),
          startDate,
          endDate,
          imageUrl,
          description,
          venueId: type === 'In person' ? newVenueId : null,
        }),
      });

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        navigate(`/events/${eventData.id}`);
      } else {
        const eventErrorData = await eventResponse.json();
        console.error('Event creation error:', eventErrorData);
        // Map error objects to strings for rendering
        const formattedErrors = {};
        if (eventErrorData.errors) {
          for (const key in eventErrorData.errors) {
            formattedErrors[key] = eventErrorData.errors[key].msg;
          }
        } else {
          formattedErrors.message = eventErrorData.message;
        }
        setErrors(formattedErrors);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setErrors({ message: 'Network or server error: ' + error.message });
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="section-create-event-header">
          <h2>Create a new event for {groupName}</h2>
        </div>
        <div className="section-create-event">
          <label>What is the name of your event?</label><br />
          {errors.name && <p className="field-error">{errors.name}</p>}
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="section-create-event">
          <label>Is this an in-person or online event?</label><br />
          {errors.type && <p className="field-error">{errors.type}</p>}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Online">Online</option>
            <option value="In person">In person</option>
          </select>
        </div>
        <div className="section-create-event">
          <label>Is this event private or public?</label><br />
          {errors.isPrivate && <p className="field-error">{errors.isPrivate}</p>}
          <select value={isPrivate} onChange={(e) => setIsPrivate(e.target.value)}>
            <option value="true">Private</option>
            <option value="false">Public</option>
          </select>
        </div>
        <div className="section-create-event">
          <label>What is the price for your event?</label><br />
          {errors.price && <p className="field-error">{errors.price}</p>}
          <input
            type="number"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            />
        </div>
        <div className="section-create-event-row">
          <div className="section-create-event">
            <label>When does your event start?</label><br />
            {errors.startDate && <p className="field-error">{errors.startDate}</p>}
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              />
          </div>
          <div className="section-create-event">
            <label>When does your event end?</label><br />
            {errors.endDate && <p className="field-error">{errors.endDate}</p>}
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              />
          </div>
        </div>
        <div className="section-create-event">
          <label>Please add an image URL for your event below:</label><br />
          {errors.imageUrl && <p className="field-error">{errors.imageUrl}</p>}
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div className="section-create-event">
          <label>Please describe your event:</label><br />
          {errors.description && <p className="field-error">{errors.description}</p>}
          <textarea
            placeholder="Please include at least 30 characters"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="section-create-event">
          <label>What is the capacity for your event?</label><br />
          {errors.capacity && <p className="field-error">{errors.capacity}</p>}
          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            />
        </div>
        {type === 'In person' && (
          <>
            <div className="section-create-event">
              <label>Venue Address:</label><br />
              {errors.venueAddress && <p className="field-error">{errors.venueAddress}</p>}
              <input
                type="text"
                placeholder="Venue Address"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
            </div>
            <div className="section-create-event-row">
              <div className="section-create-event">
                <label>Venue City:</label><br />
                {errors.venueCity && <p className="field-error">{errors.venueCity}</p>}
                <input
                  type="text"
                  placeholder="Venue City"
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                />
              </div>
              <div className="section-create-event">
                <label>Venue State:</label><br />
                {errors.venueState && <p className="field-error">{errors.venueState}</p>}
                <select
                  value={venueState}
                  onChange={(e) => setVenueState(e.target.value)}
                >
                  <option value="">Select State</option>
                  {stateAbbreviations.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="section-create-event-row">
              <div className="section-create-event">
                <label>Venue Latitude:</label><br />
                {errors.venueLat && <p className="field-error">{errors.venueLat}</p>}
                <input
                  type="text"
                  placeholder="Venue Latitude"
                  value={venueLat}
                  onChange={(e) => setVenueLat(e.target.value)}
                />
              </div>
              <div className="section-create-event">
                <label>Venue Longitude:</label><br />
                {errors.venueLng && <p className="field-error">{errors.venueLng}</p>}
                <input
                  type="text"
                  placeholder="Venue Longitude"
                  value={venueLng}
                  onChange={(e) => setVenueLng(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
        <div className="section-create-event-submit">
          <hr />
          {formIncomplete && (
            <div className="form-incomplete-error">
              <p>Incomplete form - see requirements above</p>
            </div>
          )}
          <button
            type="submit"
            className={`create-event-button ${!name || !type || !isPrivate || !price || !capacity || !startDate || !endDate || !imageUrl || !description || description.length < 30 || description.length > 2000 || (type === 'In person' && (!venueAddress || !venueCity || !venueState)) ? 'grey' : ''}`}
          >
            Create Event
          </button>
        </div>
        {errors.message && <p className="field-error">{errors.message}</p>}
        {errors && Object.keys(errors).map((key, idx) => (
          <p key={idx} className="field-error">{errors[key]}</p>
        ))}
      </form>
    </div>
  );
};

export default CreateEventForm;
