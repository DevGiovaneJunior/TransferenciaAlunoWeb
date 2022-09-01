using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Web.Transfer.Controllers
{
    public class ExternaController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
