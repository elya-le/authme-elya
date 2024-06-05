import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateGroupForm.css';

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('In person');
  const [privateGroup, setPrivateGroup] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  const [formIncomplete, setFormIncomplete] = useState(false);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const formatCityName = (city) => {
    if (city.length === 3) {
      return city.toUpperCase();
    }
    return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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

    return () => {
      setName('');
      setAbout('');
      setType('In person');
      setPrivateGroup(false);
      setCity('');
      setState('');
      setImage(null);
      setErrors({});
      setFormIncomplete(false);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormIncomplete(false);

    const formattedCity = formatCityName(city);

    const newErrors = {};

    if (!name) newErrors.name = 'Name is required';
    if (!about || about.length < 30) newErrors.about = 'Description needs 30 or more characters';
    if (!formattedCity) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormIncomplete(true);
      return;
    }

    console.log('Submitting group data:', { name, about, type, private: privateGroup, city: formattedCity, state });

    const groupResponse = await fetch('/api/groups', {
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
        city: formattedCity,
        state,
      }),
    });

    if (groupResponse.ok) {
      const groupData = await groupResponse.json();
      console.log('Group created:', groupData);

      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        console.log('Submitting image file:', image);

        const imageResponse = await fetch(`/api/uploads`, {
          method: 'POST',
          headers: {
            'CSRF-Token': csrfToken,
          },
          body: formData,
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          console.log('Image uploaded:', imageData);
          await fetch(`/api/groups/${groupData.id}/images`, {
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
          console.error('Error uploading image:', imageErrorData);
          setErrors((prevErrors) => ({ ...prevErrors, image: imageErrorData.errors.url }));
          return;
        }
      }

      navigate(`/groups/${groupData.id}`);
    } else {
      const errorData = await groupResponse.json();
      const formattedErrors = Object.keys(errorData.errors).reduce((acc, key) => {
        acc[key] = errorData.errors[key].msg;
        return acc;
      }, {});
      console.error('Error creating group:', formattedErrors);
      setErrors(formattedErrors);
    }
  };

  const handleAutoPopulate = () => {
    setName('Test Group Name');
    setAbout('This is a sample group description. It has more than 30 characters to pass validation.');
    setType('In person');
    setPrivateGroup(false);
    setCity('Test City');
    setState('NY');
    setImage(null);
  };

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <div className='section1-create-group-header'>
          <h2>Start a New Group</h2>
          <br></br><button type='button' onClick={handleAutoPopulate} className='auto-populate-button'>
          Auto populate this form for testing
          </button>
        </div>
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
          {errors.image && <p className='field-error'>{errors.image}</p>}
          <input
            type='file'
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <div className='section8-create-group-submit'>
          <hr />
          {formIncomplete && (
            <div className='form-incomplete-error'>
              <p>Incomplete form - see requirements above</p>
            </div>
          )}
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
