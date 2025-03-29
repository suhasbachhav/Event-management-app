import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import { useState } from 'react';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState();

  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {mutate, isPending: isPendingDelete, isError: isErrorDelete, error: errorDelete } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () =>{
      queryClient.invalidateQueries({
        queryKey:['events'],
        refetchType: none
      });
      navigate('/events')
    }
  });

  function handleDelete(){
    mutate({id: params.id})
  }

  function handleStartDelete(){
    setIsDeleting(true);
  }

  function handleStopDelete(){
    setIsDeleting(false);
  }

  let content;

  if (isPending) {
    content = <div id='event-details-content' className='center'>
      <p>Fetching something data...</p>
    </div>
  }

  if (isError) {
    content = <div id='event-details-content' className='center'>
      <ErrorBlock title="Failed to load content" message={error.info?.message || "Failed to fetch events data, try leter again"} />
    </div>
  }

  if (data) {

    const formattedDate = new Date(data.date).toLocaleDateString('en-US',{
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    content =
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
  }



  return (
    <>
      {isDeleting && (<Modal onClick={handleStopDelete}>
        <h2>
          Are you sure?
        </h2>
        <p>
          Do you really want to delete this event? This action cannot be undone
        </p>
        <div className='form-actions'>
          {isPendingDelete && <p>Deleting, please wait</p> }
          {
            !isPendingDelete &&
            (<>
              <button onClick={handleStopDelete} className='button-text'>Cancel</button>
              <button onClick={handleDelete} className='button'>Delete</button>
            </> )
          }
        </div>
        {isErrorDelete && <ErrorBlock title="Failed to delete event" message={errorDelete.info?.message || "Please try again later"}/>}
      </Modal>)}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
    </>
  );
}
