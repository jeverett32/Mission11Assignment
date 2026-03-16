using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<BookPageResponse>> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortOrder = "asc"
    )
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 5;
        }

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var query = _context.Books.AsNoTracking();

        query = sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase)
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        var totalBooks = await query.CountAsync();
        var books = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(
            new BookPageResponse
            {
                Books = books,
                TotalBooks = totalBooks,
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalBooks / (double)pageSize),
                SortOrder = sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc"
            }
        );
    }
}

public class BookPageResponse
{
    public List<Book> Books { get; set; } = [];

    public int TotalBooks { get; set; }

    public int CurrentPage { get; set; }

    public int PageSize { get; set; }

    public int TotalPages { get; set; }

    public string SortOrder { get; set; } = "asc";
}
