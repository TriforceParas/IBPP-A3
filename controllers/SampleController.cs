// ...existing code...
public class SampleController : ControllerBase
{
    // ...existing code...

    // Added By :
    // Date Added :-
    [HttpGet]
    public IActionResult GetAll()
    {
        // ...existing code...
    }

    // Added By :
    // Date Added :-
    [HttpPost]
    public IActionResult Create([FromBody] SampleModel model)
    {
        // ...existing code...
    }

    // ...existing code...
}

