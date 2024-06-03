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
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  const [formIncomplete, setFormIncomplete] = useState(false);
  const [groupName, setGroupName] = useState('');

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
    if (description.length < 30) newErrors.description = 'Description needs 30 or more characters'; // added min length validation
    if (description.length > 2000) newErrors.description = 'Description cannot exceed 2000 characters'; // added max length validation
    if (type === 'In person' && !venueId) newErrors.venueId = 'Venue is required for in-person events';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormIncomplete(true);
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/events`, {
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
          venueId: type === 'In person' ? venueId : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/events/${data.id}`);
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors ? errorData.errors : { message: errorData.message });
      }
    } catch (error) {
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
              <div className="section-create-event">
                <label>Venue ID for the event:</label><br />
                {errors.venueId && <p className="field-error">{errors.venueId}</p>}
                <input
                  type="text"
                  placeholder="Venue ID"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                />
              </div>
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
            className={`create-event-button ${!name || !type || !isPrivate || !price || !capacity || !startDate || !endDate || !imageUrl || !description || description.length < 30 || description.length > 2000 ? 'grey' : ''}`}
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
