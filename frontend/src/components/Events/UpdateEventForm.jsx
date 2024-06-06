import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UpdateEventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.session.user);
  const [name, setName] = useState('');
  const [type, setType] = useState('In person');
  const [isPrivate, setIsPrivate] = useState('false');
  const [price, setPrice] = useState('0');
  const [capacity, setCapacity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [venueId, setVenueId] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('');
  const [venueLat, setVenueLat] = useState('');
  const [venueLng, setVenueLng] = useState('');
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [groupName, setGroupName] = useState('');

  const stateAbbreviations = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        if (data.Group.organizerId !== currentUser.id) {
          navigate('/');
          return;
        }
        setIsOwner(true);
        setName(data.name);
        setType(data.type);
        setIsPrivate(data.private ? 'true' : 'false');
        setPrice(data.price);
        setCapacity(data.capacity);
        setStartDate(formatDateForInput(data.startDate));
        setEndDate(formatDateForInput(data.endDate));
        setDescription(data.description);
        setVenueId(data.Venue?.id || '');
        setVenueAddress(data.Venue?.address || '');
        setVenueCity(data.Venue?.city || '');
        setVenueState(data.Venue?.state || '');
        setVenueLat(data.Venue?.lat || '');
        setVenueLng(data.Venue?.lng || '');
        setGroupName(data.Group.name);
      } catch (err) {
        setErrors({ message: err.message });
      }
    };

    if (currentUser) {
      fetchEventData();
    } else {
      navigate('/');
    }

    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf/restore', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setCsrfToken(data['XSRF-Token']);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, [eventId, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!description || description.length < 30) newErrors.description = 'Description needs 30 or more characters';
    if (!startDate) newErrors.startDate = 'Event start is required';
    if (!endDate) newErrors.endDate = 'Event end is required';
    if (type === 'In person' && (!venueAddress || !venueCity || !venueState)) {
      newErrors.venueAddress = 'Venue address, city, and state are required for in-person events';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const eventPayload = {
      name,
      type,
      private: isPrivate === 'true',
      price: parseFloat(price),
      capacity: parseInt(capacity, 10),
      startDate,
      endDate,
      description,
      venueId: type === 'In person' ? venueId : null,
    };

    const eventResponse = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify(eventPayload),
    });

    if (eventResponse.ok) {
      const eventData = await eventResponse.json();
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const imageResponse = await fetch(`/api/event-uploads`, {
          method: 'POST',
          headers: {
            'CSRF-Token': csrfToken,
          },
          body: formData,
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          await fetch(`/api/events/${eventData.id}/images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'CSRF-Token': csrfToken,
            },
            body: JSON.stringify({
              url: imageData.url,
              preview: true,
            }),
          });
        } else {
          const imageErrorData = await imageResponse.json();
          setErrors((prevErrors) => ({ ...prevErrors, image: imageErrorData.errors.url }));
          return;
        }
      }

      navigate(`/events/${eventData.id}`);
    } else {
      const errorData = await eventResponse.json();
      setErrors(errorData.errors || { message: errorData.message });
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <div className='section-create-event-header'>
          <h2>Update Event for {groupName}</h2>
        </div>
        <div className='section-create-event'>
          <label>What is the name of your event?</label><br />
          {errors.name && <p className='field-error'>{errors.name}</p>}
          <input
            type='text'
            placeholder='Event Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className='section-create-event'>
          <label>Is this an in-person or online event?</label><br />
          {errors.type && <p className='field-error'>{errors.type}</p>}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
        </div>
        <div className='section-create-event'>
          <label>Is this event private or public?</label><br />
          {errors.isPrivate && <p className='field-error'>{errors.isPrivate}</p>}
          <select value={isPrivate} onChange={(e) => setIsPrivate(e.target.value)}>
            <option value='true'>Private</option>
            <option value='false'>Public</option>
          </select>
        </div>
        <div className='section-create-event'>
          <label>What is the price for your event?</label><br />
          {errors.price && <p className='field-error'>{errors.price}</p>}
          <input
            type='number'
            placeholder='0'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className='section-create-event-row'>
          <div className='section-create-event'>
            <label>When does your event start?</label><br />
            {errors.startDate && <p className='field-error'>{errors.startDate}</p>}
            <input
              type='datetime-local'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className='section-create-event'>
            <label>When does your event end?</label><br />
            {errors.endDate && <p className='field-error'>{errors.endDate}</p>}
            <input
              type='datetime-local'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className='section-create-event'>
          <label>Please add an image for your event below:</label><br />
          {errors.image && <p className='field-error'>{errors.image}</p>}
          <input
            type='file'
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <div className='section-create-event'>
          <label>Please describe your event:</label><br />
          {errors.description && <p className='field-error'>{errors.description}</p>}
          <textarea
            placeholder='Please include at least 30 characters'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className='section-create-event'>
          <label>What is the capacity for your event?</label><br />
          {errors.capacity && <p className='field-error'>{errors.capacity}</p>}
          <input
            type='number'
            placeholder='Capacity'
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
        {type === 'In person' && (
          <>
            <div className='section-create-event'>
              <label>Address:</label><br />
              {errors.venueAddress && <p className='field-error'>{errors.venueAddress}</p>}
              <input
                type='text'
                placeholder='Venue Address'
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
            </div>
            <div className='section-create-event-row'>
              <div className='section-create-event'>
                <label>City:</label><br />
                {errors.venueCity && <p className='field-error'>{errors.venueCity}</p>}
                <input
                  type='text'
                  placeholder='City'
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                />
              </div>
              <div className='section-create-event'>
                <label>State:</label><br />
                {errors.venueState && <p className='field-error'>{errors.venueState}</p>}
                <select
                  value={venueState}
                  onChange={(e) => setVenueState(e.target.value)}
                >
                  <option value=''>Select State</option>
                  {stateAbbreviations.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='section-create-event-row'>
              <div className='section-create-event'>
                <label>Latitude (Optional):</label><br />
                {errors.venueLat && <p className='field-error'>{errors.venueLat}</p>}
                <input
                  type='text'
                  placeholder='Must be within -90 and 90'
                  value={venueLat}
                  onChange={(e) => setVenueLat(e.target.value)}
                />
              </div>
              <div className='section-create-event'>
                <label>Longitude (Optional):</label><br />
                {errors.venueLng && <p className='field-error'>{errors.venueLng}</p>}
                <input
                  type='text'
                  placeholder='Must be within -180 and 180'
                  value={venueLng}
                  onChange={(e) => setVenueLng(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
        <div className='section-create-event-submit'>
          <hr />
          <button
            type='submit'
            className={`create-event-button ${!name || !type || !isPrivate || !price || !capacity || !startDate || !endDate || !description || description.length < 30 || description.length > 2000 || (type === 'In person' && (!venueAddress || !venueCity || !venueState)) ? 'grey' : ''}`}
          >
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateEventForm;
