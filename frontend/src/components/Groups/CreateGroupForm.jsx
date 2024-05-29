import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateGroupForm.css';

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('Online');
  const [privateGroup, setPrivateGroup] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  const [formIncomplete, setFormIncomplete] = useState(false);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
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

    // Clear form data and errors on unmount
    return () => {
      setName('');
      setAbout('');
      setType('Online');
      setPrivateGroup(false);
      setCity('');
      setState('');
      setImageUrl('');
      setErrors({});
      setFormIncomplete(false);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setFormIncomplete(false); // Reset form incomplete error

    const newErrors = {};

    if (!name) newErrors.name = 'Name is required';
    if (!about || about.length < 30) newErrors.about = 'Description needs 30 or more characters';
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormIncomplete(true);
      return;
    }

    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        name,
        about,
        type,
        private: privateGroup,
        city,
        state,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (imageUrl) {
        const imageResponse = await fetch(`/api/groups/${data.id}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            url: imageUrl,
            preview: true,
          }),
        });

        if (!imageResponse.ok) {
          const imageErrorData = await imageResponse.json();
          setErrors((prevErrors) => ({ ...prevErrors, imageUrl: imageErrorData.errors.url }));
          return;
        }
      }

      navigate(`/groups/${data.id}`);
    } else {
      const errorData = await response.json();
      const formattedErrors = Object.keys(errorData.errors).reduce((acc, key) => {
        acc[key] = errorData.errors[key].msg;
        return acc;
      }, {});
      setErrors(formattedErrors);
    }
  };

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <div className='section1-create-group-header'>
          <h2>Start a New Group</h2>
        </div>

        {/* {Object.keys(errors).length > 0 && (
          <div className='error-messages'>
            <ul>
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )} */}

        <div className='section2-create-group-location'>
          <hr />
          <label>Set your group&apos;s location</label><br />
          <p>MeetPup groups meet locally, in person, and online. We&apos;ll connect you with people in your area.</p><br />
          {errors.city && <p className='field-error'>{errors.city}</p>}
          <input
            type='text'
            placeholder='City'
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <br />
          {errors.state && <p className='field-error'>{errors.state}</p>}
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value=''>Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className='section3-create-group-name'>
          <hr />
          <label>What will your group&apos;s name be?</label><br />
          <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</p><br />
          {errors.name && <p className='field-error'>{errors.name}</p>}
          <input
            type='text'
            placeholder='What is your group name?'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className='section4-create-group-about'>
          <hr />
          <label>Describe the purpose of your group.</label><br />
          <p>
            People will see this when we promote your group,<br />
            but you&apos;ll be able to add to it later, too. <br /><br />
            1. What is the purpose of the group?<br />
            2. Who should join?<br />
            3. What will you do at your events?
          </p><br />
          {errors.about && <p className='field-error'>{errors.about}</p>}
          <textarea
            placeholder='Please write at least 30 characters'
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>

        <div className='section5-create-group-type'>
          <hr />
          {errors.type && <p className='field-error'>{errors.type}</p>}
          <label>Is this an in-person or online group?</label><br />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
        </div>

        <div className='section6-create-group-privacy'>
          <hr />
          <label>Is this group private or public?</label><br />
          {errors.private && <p className='field-error'>{errors.private}</p>}
          <select
            value={privateGroup}
            onChange={(e) => setPrivateGroup(e.target.value === 'true')}
          >
            <option value={true}>Private</option>
            <option value={false}>Public</option>
          </select>
        </div>

        <div className='section7-create-group-image'>
          <hr />
          <label>Please add an image URL for your group below:</label><br />
          {errors.imageUrl && <p className='field-error'>{errors.imageUrl}</p>}
          <input
            type='text'
            placeholder='Image URL'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className='section8-create-group-submit'>
          <hr />
          {formIncomplete && (
            <div className='form-incomplete-error'>
              <p>Incomplete form - see requirements above</p>
            </div>
          )} <br></br>
          <button
            type='submit'
            className={`create-group-button ${!name || !about || about.length < 30 || !city || !state ? 'grey' : ''}`}
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;
